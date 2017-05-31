<?php
//header('Cache-Control: no-cache, must-revalidate');
//header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
$mothed=$_SERVER['REQUEST_METHOD'];
re($mothed);

function re($type){
	if($type=='POST'){
		if(isset($_POST['type'])){
			success($type);
		}else{
			error($type);
		}
	}else if($type=='GET'){
		if(isset($_GET['type'])){
			success($type);
		}else{
			error($type);
		}
	}
	else if($type=='PUT'){
		if(isset($_PUT['type'])){
			success($type);		
		}else{
			error($type);	
		}
	}
	exit();
}
success($type){
	echo 'success '.$type;
}
error($type){
	header("HTTP/1.1 404 type error");
	echo 'error type is '.$type;	
}
