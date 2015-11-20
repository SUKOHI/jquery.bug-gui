<?php

$save_path = '/YOUR_PATH_TO_SAVE_IMAGES/'. $_POST['file_name'];
$result = false;

try {

	$data = $_POST['image_data'];
	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data = base64_decode($data);
	file_put_contents($save_path, $data);
	$result = true;

} catch(Exception $e) {}

echo json_encode(['result' => $result]);