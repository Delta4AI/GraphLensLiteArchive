import pandas as pd
import os

root_folder = "/home/matthias/OneDrive/01_Projects/25_Graph_Lens_Lite/GLL_Albumin/"

nodes = pd.read_excel(os.path.join(root_folder, "Nodes_File_clustered.xlsx"))
edges = pd.read_excel(os.path.join(root_folder, "Edge_File.xlsx"))

albumin = nodes[nodes["ENSG"] == "ENSG00000163631"]

cluster_1 = pd.concat([nodes[nodes["Cluster"] == 1], albumin]).drop(columns=["Cluster"])
cluster_2 = pd.concat([nodes[nodes["Cluster"] == 2], albumin]).drop(columns=["Cluster"])
cluster_3 = pd.concat([nodes[nodes["Cluster"] == 3], albumin]).drop(columns=["Cluster"])
cluster_4 = pd.concat([nodes[nodes["Cluster"] == 4], albumin]).drop(columns=["Cluster"])
cluster_5 = pd.concat([nodes[nodes["Cluster"] == 5], albumin]).drop(columns=["Cluster"])
cluster_6 = pd.concat([nodes[nodes["Cluster"] == 6], albumin]).drop(columns=["Cluster"])
cluster_7 = pd.concat([nodes[nodes["Cluster"] == 7], albumin]).drop(columns=["Cluster"])
cluster_8 = pd.concat([nodes[nodes["Cluster"] == 8], albumin]).drop(columns=["Cluster"])

cluster_1_ensg = set(cluster_1["ENSG"])
cluster_2_ensg = set(cluster_2["ENSG"])
cluster_3_ensg = set(cluster_3["ENSG"])
cluster_4_ensg = set(cluster_4["ENSG"])
cluster_5_ensg = set(cluster_5["ENSG"])
cluster_6_ensg = set(cluster_6["ENSG"])
cluster_7_ensg = set(cluster_7["ENSG"])
cluster_8_ensg = set(cluster_8["ENSG"])

edges_1 = edges[(edges["gene_id_1"].isin(cluster_1_ensg)) & (edges["gene_id_2"].isin(cluster_1_ensg))]
edges_2 = edges[(edges["gene_id_1"].isin(cluster_2_ensg)) & (edges["gene_id_2"].isin(cluster_2_ensg))]
edges_3 = edges[(edges["gene_id_1"].isin(cluster_3_ensg)) & (edges["gene_id_2"].isin(cluster_3_ensg))]
edges_4 = edges[(edges["gene_id_1"].isin(cluster_4_ensg)) & (edges["gene_id_2"].isin(cluster_4_ensg))]
edges_5 = edges[(edges["gene_id_1"].isin(cluster_5_ensg)) & (edges["gene_id_2"].isin(cluster_5_ensg))]
edges_6 = edges[(edges["gene_id_1"].isin(cluster_6_ensg)) & (edges["gene_id_2"].isin(cluster_6_ensg))]
edges_7 = edges[(edges["gene_id_1"].isin(cluster_7_ensg)) & (edges["gene_id_2"].isin(cluster_7_ensg))]
edges_8 = edges[(edges["gene_id_1"].isin(cluster_8_ensg)) & (edges["gene_id_2"].isin(cluster_8_ensg))]

cluster_1.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_1.xlsx"), index=False)
cluster_2.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_2.xlsx"), index=False)
cluster_3.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_3.xlsx"), index=False)
cluster_4.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_4.xlsx"), index=False)
cluster_5.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_5.xlsx"), index=False)
cluster_6.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_6.xlsx"), index=False)
cluster_7.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_7.xlsx"), index=False)
cluster_8.to_excel(os.path.join(root_folder, "Nodes_File_Cluster_8.xlsx"), index=False)
edges_1.to_excel(os.path.join(root_folder, "Edge_File_Cluster_1.xlsx"), index=False)
edges_2.to_excel(os.path.join(root_folder, "Edge_File_Cluster_2.xlsx"), index=False)
edges_3.to_excel(os.path.join(root_folder, "Edge_File_Cluster_3.xlsx"), index=False)
edges_4.to_excel(os.path.join(root_folder, "Edge_File_Cluster_4.xlsx"), index=False)
edges_5.to_excel(os.path.join(root_folder, "Edge_File_Cluster_5.xlsx"), index=False)
edges_6.to_excel(os.path.join(root_folder, "Edge_File_Cluster_6.xlsx"), index=False)
edges_7.to_excel(os.path.join(root_folder, "Edge_File_Cluster_7.xlsx"), index=False)
edges_8.to_excel(os.path.join(root_folder, "Edge_File_Cluster_8.xlsx"), index=False)