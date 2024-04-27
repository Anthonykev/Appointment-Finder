<?php
// 1) 

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
        {
            throw new Exception("Verbindung fehlgeschlagen: " . $this->mysqli->connect_error);
        }
    }
    public function __destruct() 
    {
        $this->mysqli->close();
    }


    public function addAppointment($title, $location, $info, $duration, $creation_date, $voting_end_date) {
        try 
        {
            $stmt = $this->mysqli->prepare("INSERT INTO `appointments`(`title`, `location`, `info`, `duration`, `creation_date`, `voting_end_date`) VALUES (?, ?, ?, ?, ?, ?)");
            if (!$stmt) 
            {
                throw new Exception("Fehler beim Vorbereiten der Anweisung: " . $this->mysqli->error);
            }
            $stmt->bind_param("sssiss", $title, $location, $info, $duration, $creation_date, $voting_end_date);
            if (!$stmt->execute()) 
            {
                throw new Exception("Fehler beim Ausführen der Anweisung: " . $stmt->error);
            }
            $stmt->close();
            return $this->mysqli->insert_id;

        } catch (Exception $e) {
            error_log($e->getMessage());
            throw $e; // Du kannst hier auch entscheiden, den Fehler weiterzuleiten oder einen benutzerdefinierten Fehler zurückzugeben.
        }
    }



    public function updateAppointment($appointment_id, $title, $location, $info, $duration, $creation_date, $voting_end_date) {
        try {
            $stmt = $this->mysqli->prepare("UPDATE `appointments` SET `title` = ?, `location` = ?, `info` = ?, `duration` = ?, `creation_date` = ?, `voting_end_date` = ? WHERE `appointment_id` = ?");
            if (!$stmt) {
                throw new Exception("Fehler beim Vorbereiten der Anweisung: " . $this->mysqli->error);
            }
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

    public function addAvailableDate($appointment_id, $proposed_date) {
        $stmt = $this->mysqli->prepare("INSERT INTO `available_dates`(`appointment_id`, `proposed_date`) VALUES (?, ?)");
        $stmt->bind_param("is", $appointment_id, $proposed_date);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public function addVote($date_id, $user_name, $comment) {
        $stmt = $this->mysqli->prepare("INSERT INTO `votes`(`date_id`, `user_name`, `comment`) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $date_id, $user_name, $comment);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }
    
}

?>
