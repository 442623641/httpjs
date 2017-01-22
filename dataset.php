<?php
//header('Cache-Control: no-cache, must-revalidate');
//header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
$mothed=$_SERVER['REQUEST_METHOD'];
re($mothed);

function re($type){
	if($type=='POST'){
		if(isset($_POST['type'])){
			echo 'success '.$type;
		}else{
			header("HTTP/1.1 404 type error");
			echo 'error'.$type;
		}
	}else if($type=='GET'){
		if(isset($_GET['type'])){
			echo 'success '.$type;
		}else{
			header("HTTP/1.1 404 type error");
			echo 'error'.$type;
		}
	}
	else if($type=='PUT'){
		if(isset($_PUT['type'])){
			echo 'success '.$type;		
		}else{
			header("HTTP/1.1 404 type error");
			echo 'error type is '.$type;	
		}
	}
	exit();
}
