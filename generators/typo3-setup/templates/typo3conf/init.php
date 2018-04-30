<?php

if (PHP_SAPI != 'cli') {
    exit(1);
}

if (!@is_file(__DIR__.DIRECTORY_SEPARATOR.'LocalConfiguration.php')) {
    exit(2);
}

if (!@is_file(__DIR__.DIRECTORY_SEPARATOR.'init.sql') || !strlen($sql = file_get_contents(__DIR__.DIRECTORY_SEPARATOR.'init.sql'))) {
    exit(3);
}

$error    = 0;
$config   = include __DIR__.DIRECTORY_SEPARATOR.'LocalConfiguration.php';
$dbParams = $config['DB'];

// >= TYPO3 8
if (!empty($dbParams['Connections']) && !empty($dbParams['Connections']['Default'])) {
    $dbParams = $dbParams['Connections']['Default'];
    $db       = new \PDO('mysql:host='.$dbParams['host'].';dbname='.$dbParams['dbname'], $dbParams['user'],
        $dbParams['password']);

// < TYPO3 8
} else {
    $db = new \PDO('mysql:host='.$dbParams['host'].';dbname='.$dbParams['database'], $dbParams['username'],
        $dbParams['password']);
}

if ($db instanceof \PDO) {
    if (!($db->query($sql) instanceof \PDOStatement)) {
        $error = 4;
    }
}

@unlink(__FILE__);
@unlink(__DIR__.DIRECTORY_SEPARATOR.'init.sql');
exit($error);
