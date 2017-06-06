// 单向链表
function Node(element) {

	this.element = element;
	this.next = null;
}

function LinkedList(){

	this.head = new Node('head');
}

var l = LinkedList.prototype;

l.insert = function (newElement, item) {

	var newNode = new Node(newElement);
	var current = this.find(item);
	newNode.next = current.next;
	current.next = newNode;
}

l.find = function(item){

	var currNode = this.head;
	while(currNode.element != item){
		currNode = currNode.next;
	}
	return currNode;
}
l.show = function(){
	var currNode = this.head;
	while (!(currNode.next == null)) {
		console.log(currNode.next.element);
		currNode = currNode.next;
	}
}

l.findPrevious =  function (item) {
	var currNode = this.head;
	while (!(currNode.next == null) &&
		(currNode.next.element != item)) {
		currNode = currNode.next;
	}
	return currNode;
}

l.remove = function(item) {
	var prevNode = this.findPrevious(item);
	if (!(prevNode.next == null)) {
		prevNode.next = prevNode.next.next;
	}
}

var n = new LinkedList();
n.insert('one', 'head');
n.insert('two', 'one');
n.insert('three', 'two');

n.remove('three');

//双向链表
function NodeDouble(element) {

	this.element = element;
	this.next = null;
	this.previous = null;
}

function LinkedListDouble(){

	this.head = new NodeDouble('head');
	//创建循环链表
	//this.head.next = this.head;
}

var lD = LinkedListDouble.prototype;

lD.insert = function (newElement, item) {

	var newNode = new NodeDouble(newElement);
	var current = this.find(item);
	newNode.next = current.next;
	newNode.previous = current;
	current.next = newNode;
}

lD.find = function(item){

	var currNode = this.head;
	while(currNode.element != item){
		currNode = currNode.next;
	}
	return currNode;
}
lD.show = function(){
	var currNode = this.head;
	while (!(currNode.next == null)) {
		console.log(currNode.next.element);
		currNode = currNode.next;
	}
}

lD.remove = function(item) {

	var currNode = this.find(item);
	if (!(currNode.next == null)) {
		currNode.previous.next = currNode.next;
		currNode.next.previous = currNode.previous;
		currNode.next = null;
		currNode.previous = null;
	}else{
		currNode.previous.next = null;
	}
}
lD.findLast = function() {
	var currNode = this.head;
	while (!(currNode.next == null)) {
		currNode = currNode.next;
	}
	return currNode;
}
lD.dispReverse = function () {
	var currNode = this.head;
	currNode = this.findLast();
	while (!(currNode.previous == null)) {
		console.log(currNode.element);
		currNode = currNode.previous;
	}
}

var nD = new LinkedListDouble();
nD.insert('one', 'head');
nD.insert('two', 'one');
nD.insert('three', 'two');

//nD.remove('three');



