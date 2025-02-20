import argparse
import os
import pandas as pd
import json
import math
from collections import defaultdict

GROUP_MAJOR_DEFAULT: str = "Ungrouped Major"
GROUP_MINOR_DEFAULT: str = "Ungrouped Minor"

NODE_DESCRIPTION = "Node filters"
EDGE_DESCRIPTION = "Edge filters"

TRANSLATION_FILE_NODE_IDX_CUTOFF: int = 68
TRANSLATION_FILE_MASTERFILE_COLUMN_NAME: str = "Column in masterfile"
TRANSLATION_FILE_NEW_COLUMN_NAME: str = "Node filters"

FLOAT_PRECISION: int = 6
EDGE_CONNECTOR: str = "::"


class Formatter:
    def __init__(self, edge_file: str, node_file: str, out_file: str, translations_file: str,
                 translations_node_idx_cutoff: int, translations_masterfile_column_name: str,
                 translations_new_column_name: str, float_precision: int,
                 hard_limit_nodes: int | None, hard_limit_edges: int | None):
        self.edge_file = edge_file
        self.node_file = node_file
        self.out_file = out_file
        self.translations_file = translations_file
        self.t_node_idx_cutoff = translations_node_idx_cutoff
        self.t_old_col = translations_masterfile_column_name
        self.t_new_col = translations_new_column_name
        self.float_precision = float_precision
        self.hard_limit_nodes = hard_limit_nodes
        self.hard_limit_edges = hard_limit_edges

        self.translations = {}
        self.edges = []
        self.nodes = []

    def run(self):
        self.parse_translations()
        self.parse_edges()
        self.parse_nodes()
        self.export()

    def export(self):
        if self.hard_limit_nodes is not None or self.hard_limit_edges is not None:
            edges, nodes = self.limit_graph()
        else:
            edges, nodes = self.edges, self.nodes

        with open(self.out_file, "w") as json_file:
            json.dump({"nodes": nodes, "edges": edges}, json_file)
        print(f"Created {os.path.abspath(self.out_file)} with {len(nodes)} nodes and {len(edges)} edges")

    def limit_graph(self):
        edges = []
        nodes = []
        existing_nodes = set()
        for edge in self.edges:
            if self._limits_reached(edges, nodes):
                break
            edges.append(edge)
            for node in self.nodes:
                if node["id"] == edge["source"] or node["id"] == edge["target"]:
                    if node["id"] in existing_nodes:
                        continue
                    nodes.append(node)
                    existing_nodes.add(node["id"])
        return edges, nodes

    def _limits_reached(self, edges, nodes):
        if self.hard_limit_edges is not None and len(edges) >= self.hard_limit_edges:
            return True
        if self.hard_limit_nodes is not None and len(nodes) >= self.hard_limit_nodes:
            return True
        return False

    def parse_translations(self):
        df = self._parse_excel(file_name=self.translations_file)

        if df is None:
            return

        current_section = None

        for idx, row in df.iterrows():
            if not pd.isna(row[self.t_new_col]) and pd.isna(row[self.t_old_col]):
                current_section = row[self.t_new_col]

            if not pd.isna(row[self.t_old_col]) and not pd.isna(row[self.t_new_col]):
                if row[self.t_old_col] in self.translations:
                    print(f"WARNING - Duplicate key found!! Existing: {self.translations[row[self.t_old_col]]}, "
                          f"new mention in line {idx}: {row[self.t_old_col]}")

                self.translations[row[self.t_old_col]] = {
                    "GROUP_MAJOR": NODE_DESCRIPTION if idx < self.t_node_idx_cutoff else EDGE_DESCRIPTION,
                    "GROUP_MINOR": current_section,
                    "label": row[self.t_new_col]
                }

        print(f"Parsed {len(self.translations)} translations from {self.translations_file}")

    def parse_edges(self):
        df = self._parse_excel(file_name=self.edge_file)
        column_names = list(df.columns)
        source_col = column_names[0]
        target_col = column_names[1]

        edges = dict()

        for _, row in df.iterrows():
            _id = f"{row[source_col]}{EDGE_CONNECTOR}{row[target_col]}"
            if _id not in edges:
                edges[_id] = {
                    "id": _id,
                    "source": row[source_col],
                    "target": row[target_col],
                    "D4Data": defaultdict(lambda: defaultdict(dict))
                }
            for col in column_names[2:]:
                value = self._truncate_value(row[col])
                self._translate_and_append(key=col, edge_or_node=edges[_id], value=value)

        for edge in edges.values():
            self.edges.append(edge)

    def parse_nodes(self):
        df = self._parse_excel(file_name=self.node_file)
        column_names = list(df.columns)
        id_col = column_names[0]
        description_col = column_names[1]
        label_col = column_names[2]

        for _, row in df.iterrows():
            node = {
                "id": row[id_col],
                "label": row[label_col],
                "description": row[description_col],
                "D4Data": defaultdict(lambda: defaultdict(dict))
            }
            for col in column_names[3:]:
                value = self._truncate_value(row[col])
                self._translate_and_append(key=col, edge_or_node=node, value=value)

            self.nodes.append(node)

    @staticmethod
    def _truncate_value(value: float | int | str) -> int | float | str:
        try:
            numeric_value = float(value)
        except (ValueError, TypeError):
            return value

        if math.isnan(numeric_value):
            return ""

        if numeric_value.is_integer():
            return int(numeric_value)

        return round(numeric_value, FLOAT_PRECISION)

    def _translate_and_append(self, key: str, edge_or_node: dict, value: float | int):
        if value is not None and not (isinstance(value, float) and math.isnan(value)):
            group_major = self.translations[key]["GROUP_MAJOR"] if key in self.translations else GROUP_MAJOR_DEFAULT
            group_minor = self.translations[key]["GROUP_MINOR"] if key in self.translations else GROUP_MINOR_DEFAULT
            param_label = self.translations[key]["label"] if key in self.translations else key
            if (group_major in edge_or_node["D4Data"]
                    and group_minor in edge_or_node["D4Data"][group_major]
                    and param_label in edge_or_node["D4Data"][group_major][group_minor]):
                print(f"WARNING - Duplicate value found for {group_major}|{group_minor}|{param_label}!\n"
                      f"Existing: {edge_or_node['D4Data'][group_major][group_minor][param_label]}, new: {value}\n"
                      f"Existing value will be overwritten with new value.")
            edge_or_node["D4Data"][group_major][group_minor][param_label] = value

    @staticmethod
    def _parse_excel(file_name: str):
        if not os.path.isfile(file_name):
            return None
        df = pd.read_excel(file_name, engine="openpyxl")
        print(f"Read {file_name} with {df.shape[0]} rows and {df.shape[1]} columns")
        return df


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
    description=(
        "Formats Excel files with node and edge properties into a Graph Lens Lite compatible JSON format.\n\n"
        "Edge File Requirements:\n"
        "  - Column 0: Source ID\n"
        "  - Column 1: Target ID\n\n"
        "Node File Requirements:\n"
        "  - Column 0: Node ID\n"
        "  - Column 1: Node Description\n"
        "  - Column 2: Node Label"
        ),
    formatter_class=argparse.RawTextHelpFormatter
)


    parser.add_argument("--edge-file", "-e", default="250123_HF_MASTERFILE_edge_properties_TOGO.xlsx",
                        type=str, help="Model Edge Properties Excel File")
    parser.add_argument("--node-file", "-n", default="250123_HF_MASTERFILE_node_properties_TOGO.xlsx",
                        type=str, help="Model Node Properties Excel File")
    parser.add_argument("--out-file", "-o", default="model.json", type=str, help="Output file name")
    parser.add_argument("--translations-file", "-t", default="Model-visualization-filtering-panel.xlsx",
                        nargs="?", type=str, help="Optional Excel File for Column Name Translations")
    parser.add_argument("--translations-node-idx-cutoff", "-c", default=TRANSLATION_FILE_NODE_IDX_CUTOFF,
                        nargs="?", type=int,
                        help="Set to row index in optional excel file for column name transitions where "
                             "'Edge filters' is written minus 1 (=index from where edge properties start)")
    parser.add_argument("--translations-masterfile-column-name", "-m",
                        default=TRANSLATION_FILE_MASTERFILE_COLUMN_NAME, nargs="?", type=str,
                        help="Set to column name containing labels in original data")
    parser.add_argument("--translations-new-column-name", "-f", default=TRANSLATION_FILE_NEW_COLUMN_NAME,
                        nargs="?", type=str, help="Set to column name containing new / human readable labels")
    parser.add_argument("--float-precision", "-fp", default=FLOAT_PRECISION, nargs="?", type=int,
                        help=f"Set to desired float precision to truncate all values (default: {FLOAT_PRECISION})")
    parser.add_argument("--hard-limit-nodes", "-hl", default=None, nargs="?", type=int,
                        help="Hard limit on number of nodes")
    parser.add_argument("--hard-limit-edges", "-he", default=None, nargs="?", type=int,
                        help="Hard limit on number of edges")
    args = parser.parse_args()
    if not args.edge_file:
        exit("Please provide an edge file")
    elif not os.path.isfile(args.edge_file):
        exit(f"File not found: {os.path.realpath(args.edge_file)}\nPlease provide a valid edge file")
    if not args.node_file:
        exit("Please provide a node file")
    elif not os.path.isfile(args.node_file):
        exit(f"File not found: {os.path.realpath(args.node_file)}\nPlease provide a valid node file")
    formatter = Formatter(args.edge_file, args.node_file, args.out_file, args.translations_file,
                          args.translations_node_idx_cutoff, args.translations_masterfile_column_name,
                          args.translations_new_column_name, args.float_precision,
                          args.hard_limit_nodes, args.hard_limit_edges)
    formatter.run()
