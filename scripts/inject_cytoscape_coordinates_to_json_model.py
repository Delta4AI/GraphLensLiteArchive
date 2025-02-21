"""
1. load model in GLL
2. create new layout - name it 'grouped'
3. save model as .json
4. write this script and path to cytoscape file with coordinates as well as to new saved model
5. overwrite coordinates of 'grouped' layout
"""

import json
import datetime

FSGS_MODEL = "/home/matthias/Desktop/fsgs_model/fsgs_model_v2_mech_grouped.json"
CYTOSCAPE_MODEL = "/home/matthias/Desktop/fsgs_model/FSGS-model-Cytoscape-export.js"

with open(CYTOSCAPE_MODEL, "r") as f:
    cytoscape_model = json.load(f)

pos = dict()
for node in cytoscape_model["Sheet1"]["elements"]["nodes"]:
    if node["data"]["name"] in pos.keys():
        print("WARNING: duplicate node name found: ", node["data"]["name"],)
    pos[node["data"]["name"]] = node["position"]

with open(FSGS_MODEL, "r") as f:
    fsgs_model = json.load(f)

with open(FSGS_MODEL + datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".BACKUP", "w") as f:
    json.dump(fsgs_model, f)

for ensg in fsgs_model["layouts"]["mech_grouped"]["positions"].keys():
    if ensg not in pos.keys():
        print("WARNING: ensg not found in cytoscape model: ", ensg)
        continue

    fsgs_model["layouts"]["mech_grouped"]["positions"][ensg] = pos[ensg]

with open(FSGS_MODEL, "w") as f:
    json.dump(fsgs_model, f)