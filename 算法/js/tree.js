
function Node(data, left, right) {

	this.data = data;
	this.count = 1;
	this.left = left;
	this.right = right;
}

Node.prototype.show = function(){

	return this.data;
}

function BST() {

	this.root = null;

	//中序遍历的值（从小到达的值）
	this.arr = [];
}

//插入节点
BST.prototype.insert = function(data){

	let n = new Node(data, null, null);

	if (this.root == null) {
		this.root = n;
	}
	else {
		let current = this.root;
		let parent;
		while (true) {
			parent = current;
			if (data < current.data) {
				current = current.left;
				if (current == null) {
					parent.left = n;
					break;
				}
			}
			else {
				current = current.right;
				if (current == null) {
					parent.right = n;
					break;
				}
			}
		}
	}
}

//中序遍历 递归
BST.prototype.inOrderRecursion = function(node){	
	if (!(node == null)) {
		this.inOrderRecursion(node.left);
		this.arr.push(node.show());
		this.inOrderRecursion(node.right);
	}
}


//先序遍历 递归
BST.prototype.preOrderRecursion = function(node){	
	if (!(node == null)) {
		console.log(node.show());
		this.preOrderRecursion(node.left);		
		this.preOrderRecursion(node.right);
	}
}

//后序遍历 递归
BST.prototype.postOrderRecursion = function(node){	
	if (!(node == null)) {	
		this.postOrderRecursion(node.left);		
		this.postOrderRecursion(node.right);
		console.log(node.show());
	}
}

//获取最小值
BST.prototype.getMin = function(){
	var current = this.root;
	while (!(current.left == null)) {
		current = current.left;
	}
	return current.data;
}

//获取最大值
BST.prototype.getMax = function(){
	var current = this.root;
	while (!(current.right == null)) {
		current = current.right;
	}
	return current.data;
}

//查找给定值的节点
BST.prototype.find = function(data){

	var current = this.root;

	while(current !== null){
		if (current.data == data) {
			return current;
		}
		else if(data < current.data){
			current = current.left;
		}
		else {
			current = current.right;
		}
	}
	return null;
}

//获取 右子树中最小值的节点
BST.prototype.getSmallest = function(node){
	var current = node;
	while (!(current.left == null)) {
		current = current.left;
	}
	return current;
}

//删除数据
BST.prototype.remove = function(data){
	this.root = this.removeNode(this.root, data);
}

//删除节点
BST.prototype.removeNode = function(node, data){
	if (node == null) {
		return null;
	}
	if (data == node.data) {
		// 没有子节点的节点
		if (node.left == null && node.right == null) {
			return null;
		}
		// 没有左子节点的节点
		if (node.left == null) {
			return node.right;
		}
		// 没有右子节点的节点
		if (node.right == null) {
			return node.left;
		}
		// 有两个子节点的节点
		var tempNode = this.getSmallest(node.right);
		node.data = tempNode.data;
		node.right = this.removeNode(node.right, tempNode.data);
		return node;
	}
	else if (data < node.data) {
		node.left = this.removeNode(node.left, data);
		return node;
	}
	else {
		node.right = this.removeNode(node.right, data);
		return node;
	}
}

//记录次数
BST.prototype.update =  function(data) {
	var grade = this.find(data);
	grade.count++;
	return grade;
}

var nums = new BST();

nums.insert(23);
nums.insert(16);
nums.insert(3);
nums.insert(2);
nums.insert(99);
nums.insert(30);
nums.insert(6);
nums.insert(60);
nums.insert(100);

nums.inOrderRecursion(nums.root);
console.log(nums)
console.log('递归实现：' + nums.arr.toString());





