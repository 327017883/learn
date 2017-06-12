function Vertex(label, wasVisited) {
	this.label = label;
	this.wasVisited = wasVisited;
}

function Graph(v) {
	this.vertices = v;
	this.edges = 0;
	this.adj = [];
	for (var i = 0; i < this.vertices; ++i) {
		this.adj[i] = [];
	}

	this.marked = [];
	for (var i = 0; i < this.vertices; ++i) {
		this.marked[i] = false;
	}
}
var G = Graph.prototype;

G.addEdge = function(v, w){
	this.adj[v].push(w);
	this.adj[w].push(v);
	this.edges++;
}

G.showGraph = function(){
	
	for (var i = 0; i < this.vertices; ++i) {
		var arr = [];
		for (var j = 0; j < this.vertices; ++j) {
			if (this.adj[i][j] != undefined){
				arr.push(this.adj[i][j]);
			}
		}
		console.log(i + "->" + arr)
	}
}
G.dfs = function (v) {
	this.marked[v] = true;
	if (this.adj[v] != undefined) {
		console.log("Visited vertex: " + v);
	}
	for (var w in this.adj[v]) {
		if (!this.marked[w]) {
			this.dfs(w);
		}
	}
}
// var t = new Graph(5);
// t.addEdge(0,1);
// t.addEdge(0,2);
// t.addEdge(1,3);
// t.addEdge(2,4);
// t.showGraph();

// t.dfs(0);
//console.log(t)