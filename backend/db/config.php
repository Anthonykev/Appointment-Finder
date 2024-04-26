<!-- 0)   
     Hier stellen wir eine verbindungen zu unser Datenbank -->
<?php


function getDatabaseConnection()
{
    

$host = "localhost";    
$user = "bif2webscriptinguser";
$password = "bif2021";
$database = "appointment_finder";

$db_obj = new mysqli($host, $user, $password, $database); //Diese Zeile erstellt ein neues mysqli-Objekt und stellt eine Verbindung zur Datenbank her. Die Parameter sind die oben definierten Variablen. MIt "new" erstellen wir ein object in php
// db_obj = Datenbankobjekt 

// Zeichensatz auf UTF-8 stellen, um Kodierungsprobleme zu vermeiden
$db_obj->set_charset("utf8");


if($db_obj->connect_error) //connection_error ist vordefiniert in  ,mysqli
{
    echo "Connection Error: " . $db_obj->connect_error;
    exit();
}
return $db_obj;


}

?>





<!--

Beispiel: 
class MyClass {
    public $prop1 = "I'm a class property!";
}

$obj = new MyClass;
 
Mit "new" erstell ich in php ein Object von einer bestimmten Klasse und
 -->




