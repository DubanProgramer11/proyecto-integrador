<?php
require_once __DIR__ . '/../config/config.php';

try {
    $db = obtenerConexion();
    $stmt = $db->query("SELECT id, nombre FROM categorias ORDER BY nombre");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    responderExito('Categorías obtenidas.', $categorias);
} catch (Exception $e) {
    responderError('Error al cargar categorías: ' . $e->getMessage(), 500);
}