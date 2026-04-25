import osmnx as ox
import matplotlib.pyplot as plt

# 1. Area studi
place_name = "Padang, West Sumatra, Indonesia"

# 2. Generate graph (default: directed MultiDiGraph)
G = ox.graph_from_place(place_name, network_type='walk')

# 3. Ambil komponen terbesar (WAJIB di sini, sebelum konversi apapun)
G = ox.truncate.largest_component(G)

# 4. Tambahkan atribut penting
G = ox.add_edge_speeds(G)
G = ox.add_edge_travel_times(G)

# 5. Visualisasi
fig, ax = ox.plot_graph(G, node_size=5, edge_linewidth=0.5)
plt.show()

# 6. Simpan
ox.save_graphml(G, "padang.graphml")

print("Sukses generate jaringan jalan Padang")