<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "jugueria_el_mesias";

$connection = new mysqli($servername, $username, $password, $database);

if ($connection->connect_error) {
    die("❌ Error de conexión: " . $connection->connect_error);
}

echo "✅ Conexión exitosa a la base de datos";
?>
