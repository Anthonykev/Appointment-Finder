<?php
// 1) 
//stellen hier mit requiere once sicher dass es auch Funktioniert
require_once(__DIR__ . "/config.php");
require_once(__DIR__ . "/../models/appointment.php");
require_once(__DIR__ . "/../models/available_dates.php");
require_once(__DIR__ . "/../models/votes.php");

class DataHandler
 {
    private $mysqli;


    public function __construct() 
    {
        $this->mysqli = getDatabaseConnection();
        if ($this->mysqli->connect_error) 
        {  //sieht man dann bei der console
            throw new Exception("Verbindung fehlgeschlagen: " . $this->mysqli->connect_error);
        }
    }
    public function __destruct() 
    {
        $this->mysqli->close();
    }


    public function addAppointment($title, $location, $info, $duration, $creation_date, $voting_end_date, $dateOptions) {
        $this->mysqli->autocommit(FALSE);
        try {
            $stmt = $this->mysqli->prepare("INSERT INTO `appointments` (`title`, `location`, `info`, `duration`, `creation_date`, `voting_end_date`) VALUES (?, ?, ?, ?, ?, ?)");
            if (!$stmt) throw new Exception("Prepare failed: " . $this->mysqli->error);
            $stmt->bind_param("sssiss", $title, $location, $info, $duration, $creation_date, $voting_end_date);
            if (!$stmt->execute()) throw new Exception("Execute failed: " . $stmt->error);
            $appointmentId = $this->mysqli->insert_id;
            $stmt->close();
    
            $stmt = $this->mysqli->prepare("INSERT INTO `available_dates` (`appointment_id`, `proposed_date`, `vote_start_date`, `vote_end_date`) VALUES (?, ?, ?, ?)");
            if (!$stmt) throw new Exception("Prepare failed: " . $this->mysqli->error);
    
            foreach ($dateOptions as $dateOption) {
                if (!isset($dateOption['proposed_date'], $dateOption['vote_start_date'], $dateOption['vote_end_date'])) {
                    throw new Exception("Date options are not set properly");
                }
                $stmt->bind_param("isss", $appointmentId, $dateOption['proposed_date'], $dateOption['vote_start_date'], $dateOption['vote_end_date']);
                if (!$stmt->execute()) {
                    error_log("Execute failed: " . $stmt->error);
                    throw new Exception("Execute failed: " . $stmt->error);
                }
            }
            $stmt->close();
            $this->mysqli->commit();
            $this->mysqli->autocommit(TRUE);
            return $appointmentId;
    
        } catch (Exception $e) {
            $this->mysqli->rollback();
            $this->mysqli->autocommit(TRUE);
            error_log($e->getMessage());
            throw $e;
        }
    }
    



    public function updateAppointment($appointment_id, $title, $location, $info, $duration, $creation_date, $voting_end_date) {
        try {
            $stmt = $this->mysqli->prepare("UPDATE `appointments` SET `title` = ?, `location` = ?, `info` = ?, `duration` = ?, `creation_date` = ?, `voting_end_date` = ? WHERE `appointment_id` = ?");
            if (!$stmt) {
                throw new Exception("Fehler beim Vorbereiten der Anweisung: " . $this->mysqli->error);
            } 
            //erster Zeichen ist ein s steht für String, i ist für integer
            $stmt->bind_param("sssissi", $title, $location, $info, $duration, $creation_date, $voting_end_date, $appointment_id);
            if (!$stmt->execute()) {
                throw new Exception("Fehler beim Ausführen der Anweisung: " . $stmt->error);
            }
            $stmt->close();
            return true; // Rückgabe von true für erfolgreiche Aktualisierung
        } catch (Exception $e) {
            error_log($e->getMessage());
            throw $e;
        }
    }
    
    public function deleteAppointment($appointment_id) {
        $stmt = $this->mysqli->prepare("DELETE FROM `appointments` WHERE `appointment_id` = ?");
        $stmt->bind_param("i", $appointment_id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    // public function addAvailableDate($appointment_id, $proposed_date) {
    //     $stmt = $this->mysqli->prepare("INSERT INTO `available_dates`(`appointment_id`, `proposed_date`) VALUES (?, ?)");
    //     $stmt->bind_param("is", $appointment_id, $proposed_date);
    //     $result = $stmt->execute();
    //     $stmt->close();
    //     return $result;
    // }
    public function addAvailableDates($appointmentId, $dateOptions) {
        $values = [];
        $placeHolders = [];
        foreach ($dateOptions as $dateOption) {
            $values[] = $appointmentId;
            $values[] = $dateOption['proposed_date'];
            $values[] = $dateOption['vote_start_date'];
            $values[] = $dateOption['vote_end_date'];
            $placeHolders[] = "(?, ?, ?, ?)";
        }
    
        $stmt = $this->mysqli->prepare("INSERT INTO `available_dates` (`appointment_id`, `proposed_date`, `vote_start_date`, `vote_end_date`) VALUES " . implode(', ', $placeHolders));
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $this->mysqli->error);
        }
    
        $stmt->bind_param(str_repeat("isss", count($dateOptions)), ...$values);
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        $stmt->close();
    }

    public function addVote($date_id, $user_name, $comment) {
        $stmt = $this->mysqli->prepare("INSERT INTO `votes`(`date_id`, `user_name`, `comment`) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $date_id, $user_name, $comment);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public function getAllAppointments(){
        $appointments = [];
        //SQL Abfrage - Spalten aus Appointment -Erstellung eine Spalte Status
        $query = "SELECT *, CASE WHEN voting_end_date < NOW() THEN 'expired' ELSE 'active' END AS status FROM appointments";
        //ergebnis der Abfrage wird hier gespeichert
        $result = $this->mysqli->query($query);
        if ($result){
            //mit Fetch-assoch wird Spaltenname und Wert an row weitergegeben
            while($row = $result->fetch_assoc()){
                $appointments[] = $row;
            }
        }
        return $appointments;
    }

    public function getAppoinmentDetails($appointment_id){
        $details =[];
        //Spalte von Appointsments id gesucht ? als Platzhalter
        $stmt = $this->mysqli->prepare("SELECT * FROM appointments WHERE appointments_id = ?");
        //jetzt binden wir Platzhalter ? mit i = für Integer Ganzzahlen Sicherstellung
        $stmt ->bind_param("i", $appointment_id);
        //alles was Vorbereitet wurde wird ausgeführt 
        $stmt -> execute();
        //nachdem wird das Ergebnis mit get result Abgerufen und mit fetch Aufgerufen - für Ergbnis anzeigung
        $details['appointment'] = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        // Holen Sie die verfügbaren Terminoptionen
        $stmt = $this->mysqli->prepare("SELECT * FROM available_dates WHERE appointment_id = ?");
        $stmt->bind_param("i", $appointment_id);
        $stmt->execute();
        $availableDatesResult = $stmt->get_result();
        $details['availableDates'] = $availableDatesResult->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Holen Sie die bereits abgegebenen Stimmen
        $stmt = $this->mysqli->prepare("SELECT * FROM votes WHERE appointment_id = ?");
        $stmt->bind_param("i", $appointment_id);
        $stmt->execute();
        $votesResult = $stmt->get_result();
        $details['votes'] = $votesResult->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        return $details;
    }

    public function submitVote($appointmentId, $userName, $selectedDateIds, $comment) {
        // Beginnen Sie eine Transaktion
        $this->mysqli->begin_transaction();
    
        try {
            // Einfügen des Benutzernamens und Kommentars in die Tabelle `votes`
            $stmt = $this->mysqli->prepare("INSERT INTO votes (appointment_id, user_name, comment) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $appointmentId, $userName, $comment);
            $stmt->execute();
            $voteId = $this->mysqli->insert_id;
            $stmt->close();
    
            // Für jede date_id das zugehörige proposed_date finden und in die Tabelle `votes` einfügen
            foreach ($selectedDateIds as $dateId) {
                $proposedDate = $this->getProposedDateById($dateId);
                if ($proposedDate) {
                    // Ihr Logik zum Verarbeiten des Datums...
                } else {
                    // Datum nicht gefunden, werfen Sie einen Fehler oder behandeln Sie den Fall angemessen
                }
            }
    
            // Commit der Transaktion
            $this->mysqli->commit();
    
            return ['success' => true, 'message' => 'Die Abstimmung wurde erfolgreich gespeichert.'];
        } catch (Exception $e) {
            // Rollback der Transaktion
            $this->mysqli->rollback();
            error_log($e->getMessage());
            return ['success' => false, 'message' => 'Ein Fehler ist bei der Abstimmung aufgetreten.'];
        }
    }
    
    public function getProposedDateById($dateId) {
        $stmt = $this->mysqli->prepare("SELECT proposed_date FROM available_dates WHERE date_id = ?");
        $stmt->bind_param("i", $dateId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            return $row['proposed_date'];
        } else {
            return null; // oder werfen Sie eine Exception, falls die date_id nicht gefunden wird
        }
    }

    

    
}


?>