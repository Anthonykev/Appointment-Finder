<!-- 
3) Web Service Handling
Request des Clients an Server.
Hier werden die ganzen Request die an den HTTP Status Codes Definiert.
-->

<?php

// Logik zur Fehlerbehebung, entfernen oder auskommentieren im Produktivbetrieb
file_put_contents('debug.txt', print_r($_GET, true));

// Importieren der Logik
include("businesslogic/simpleLogic.php");


// Überprüfung und Zuweisung von GET-Parametern
$method = $_GET["method"] ?? "";  // Verwendung des Null Coalescing Operators für eine sauberere Syntax
$param = $_GET["param"] ?? [];    // Annehmen, dass 'param' ein Array von Parametern sein könnte

// Instanziierung der Logikklasse
$logic = new SimpleLogic();
$result = $logic->handleRequest($method, $param);

// Antwortfunktion, die eine entsprechende HTTP-Antwort sendet
response("GET", $result);

/**
 * Sendet eine HTTP-Antwort basierend auf dem Ergebnis der Logikschicht
 * 
 * @param string $method Der HTTP-Methodentyp, der für die Anfrage verwendet wurde.
 * @param mixed $result Das Ergebnis der Logikschicht, null wenn ein Fehler aufgetreten ist.
 */
function response($method, $result)
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
?>





<!-- // Notizen:
//  hier sind die verschiedenen Klassen von HTTP-Statuscodes:

// 1. Informationsantworten (100–199)
//     - Diese Codes zeigen an, dass die Anfrage empfangen wurde und der Prozess fortgesetzt wird.

// 2. Erfolgreiche Antworten (200–299)
//     - Diese Codes zeigen an, dass die Anfrage erfolgreich empfangen, verstanden und akzeptiert wurde.

// 3.Umleitungen (300–399)
//     - Diese Codes zeigen an, dass weitere Aktionen ausgeführt werden müssen, um die Anfrage abzuschließen.

// 4. Client-Fehlerantworten (400–499)
//     - Diese Codes zeigen an, dass die Anfrage einen schlechten Syntax hat oder nicht erfüllt werden kann.

// 5. Server-Fehlerantworten (500–599)
//     - Diese Codes zeigen an, dass der Server eine scheinbar gültige Anfrage nicht erfüllen konnte.

// Für eine vollständige Liste aller HTTP-Statuscodes und ihrer Bedeutungen, schauen Sie bitte auf die offizielle Dokumentation¹ oder auf Wikipedia². Bitte beachten Sie, dass einige Statuscodes von bestimmten Servern oder Anwendungen spezifisch definiert sein können und nicht in der allgemeinen HTTP-Spezifikation enthalten sind.
//  -->