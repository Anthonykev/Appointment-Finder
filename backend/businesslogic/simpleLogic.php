
<?php
// 2)  Die Business Logik 

// Die Business Logik entscheidet (anhand der Parameter, Methode,…)
// wie die Applikation auf diese Anfrage reagiert
 
require_once __DIR__ . "/../db/dataHandler.php";




class SimpleLogic 
{
    private $dh;

    function __construct() {
        $this->dh = new DataHandler();
    }
    // Die $method ist der Name der Methode, die aufgerufen werden soll, und $param ist ein assoziatives Array, das die Parameter für die aufzurufende Methode enthält.

    function handleRequest($method, $param) 
    {
        $res = null; // Standardwert für die Antwort
        switch ($method) 
        {
            case "addAppointment":
                $res = $this->dh->addAppointment($param['title'], $param['location'], $param['info'], $param['duration'], $param['creation_date'], $param['voting_end_date']);
                break;
            case "getAppointment":
                $res = $this->dh->getAppointment($param);
                break;
            case "updateAppointment":
                $res = $this->dh->updateAppointment($param['appointment_id'], $param['title'], $param['location'], $param['info'], $param['duration'], $param['creation_date'], $param['voting_end_date']);
                break;
            case "deleteAppointment":
                $res = $this->dh->deleteAppointment($param);
                break;
            case "addAvailableDate":
                $res = $this->dh->addAvailableDate($param['appointment_id'], $param['proposed_date']);
                break;
            case "addVote":
                $res = $this->dh->addVote($param['date_id'], $param['user_name'], $param['comment']);
                break;
            default:
                $res = "Unbekannte Methode";
                break;
        }
        return $res;
    }

}
?>
