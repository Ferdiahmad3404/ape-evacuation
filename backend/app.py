import osmnx as ox
import networkx as nx
import matplotlib.pyplot as plt
import contextily as ctx

# =========================
# 1. LOAD GRAPH
# =========================
G = ox.load_graphml("padang.graphml")

# =========================
# 2. SET KECEPATAN EVAKUASI (MANUAL)
# =========================
# Pilih sesuai skenario
speed_mps = 1.5  # meter per detik (jalan cepat)

for u, v, k, data in G.edges(keys=True, data=True):
    data['travel_time'] = data['length'] / speed_mps

# =========================
# 3. KOORDINAT (LAT, LON)
# =========================
origin_point = (-0.9253621955632871, 100.34999295084685)
destination_point = (-0.9248311874054566, 100.35328133907826)

# =========================
# 4. SNAP KE NODE
# =========================
origin_node = ox.distance.nearest_nodes(G, X=origin_point[1], Y=origin_point[0])
destination_node = ox.distance.nearest_nodes(G, X=destination_point[1], Y=destination_point[0])

# =========================
# 5. DIJKSTRA (WAKTU TERCEPAT)
# =========================
route = nx.shortest_path(G, origin_node, destination_node, weight='travel_time')

# =========================
# 6. HITUNG TOTAL WAKTU & JARAK
# =========================
total_time = 0
total_distance = 0

for u, v in zip(route[:-1], route[1:]):
    edge_data = G.get_edge_data(u, v)
    edge = list(edge_data.values())[0]

    total_time += edge['travel_time']
    total_distance += edge['length']

# konversi
total_time_minutes = total_time / 60
total_distance_km = total_distance / 1000

print(f"Total waktu: {total_time:.2f} detik ({total_time_minutes:.2f} menit)")
print(f"Total jarak: {total_distance:.2f} meter ({total_distance_km:.2f} km)")
print(f"Speed m/s: {speed_mps:.2f} m/s")

# =========================
# 7. PROJECT UNTUK BASEMAP
# =========================
G_proj = ox.project_graph(G)

# convert route ke GeoDataFrame
route_gdf = ox.routing.route_to_gdf(G, route)
route_gdf = route_gdf.to_crs(G_proj.graph['crs'])

# =========================
# 8. PLOT GRAPH
# =========================
fig, ax = ox.plot_graph(
    G_proj,
    node_size=0,
    edge_linewidth=0.5,
    bgcolor='white',
    show=False,
    close=False
)

# plot rute
route_gdf.plot(ax=ax, linewidth=3)

# =========================
# 9. BASEMAP (PETA ASLI)
# =========================
ctx.add_basemap(ax, source=ctx.providers.OpenStreetMap.Mapnik)

# zoom ke rute
ax.set_xlim(route_gdf.total_bounds[[0, 2]])
ax.set_ylim(route_gdf.total_bounds[[1, 3]])

plt.show()