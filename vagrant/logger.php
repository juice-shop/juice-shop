<?php

$logger = "/tmp/logger.php";

if ($_REQUEST['input']) {
		file_put_contents($logger, 'IP: ' . $_SERVER['REMOTE_ADDR'] . 'Date: ' . date('Y-m-d H:i:s', time()) . ", Text: " . $_REQUEST['input']. "\n", FILE_APPEND);
} else {
		echo nl2br(file_get_contents($logger));
}

