<?php


// echo json_encode($_POST);

// echo file_get_contents('php://input');

// echo $GLOBALS['HTTP_RAW_POST_DATA'];
//echo $_POST['name'];

//var_dump($_POST);

//file_get_contents("php://input");

$raw_post_data = file_get_contents('php://input');
//echo "-------\$_POST------------------\n";
//echo var_dump($_POST) . "\n";
//echo "-------php://input-------------\n";
//var_dump($raw_post_data);

//sleep(10);

echo $raw_post_data;