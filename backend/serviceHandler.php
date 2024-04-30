<?php
// Web Service Handling
// Hier werden die Anfragen des Clients entsprechend der HTTP Status Codes bearbeitet.

// Logik zur Fehlerbehebung; im Produktionsbetrieb gegebenenfalls entfernen oder auskommentieren
file_put_contents('debug.txt', print_r($_REQUEST, true));

// Importieren der Geschäftslogik
include("businesslogic/simpleLogic.php");

$methodType = $_SERVER['REQUEST_METHOD'];
$method = "";
$param = [];

if ($methodType === 'GET') {
    $method = $_GET["method"] ?? "";
    $param = $_GET["param"] ?? [];
} elseif ($methodType === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $data = json_decode($inputJSON, true); // Direktes Konvertieren des JSON-Strings in ein PHP-Array

    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        // JSON ist ungültig, sendet einen 400 Bad Request zurück
        http_response_code(400);
        die(json_encode(["error" => "Invalid JSON: " . json_last_error_msg()]));
    }

    $method = $data["method"] ?? "";
    $param = $data["param"] ?? [];
    error_log("Received params: " . print_r($param, true)); // Logging der empfangenen Parameter
}

// Instanzierung der Logikklasse
$logic = new SimpleLogic();
$result = $logic->handleRequest($method, $param);

// Antwortfunktion, die eine entsprechende HTTP-Antwort sendet
function response($methodType, $result)
{
    header('Content-Type: application/json');
    if ($result === null) {
        http_response_code(400); // Bad Request, wenn das Ergebnis null ist
        echo json_encode(["error" => "Invalid request or parameters"]);
    } else {
        http_response_code(200); // OK, wenn ein Ergebnis vorhanden ist
        echo json_encode($result);
    }
}

response($methodType, $result);
?>
