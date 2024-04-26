<!-- 
1) 
-->
<?php
require_once("config.php");
require_once("models/appointment.php");
require_once("models/available_dates.php");
require_once("models/votes.php");

class DataHandler {
    private $mysqli;

    public function __construct() 
    {
        $this->mysqli = getDatabaseConnection(); // Verwendung der Funktion, um die Verbindung zu bekommen
       
    }

    public function addAppointment($title, $location, $info, $duration, $creation_date, $voting_end_date) 
        {
        $stmt = $this->mysqli->prepare("INSERT INTO `appointments`(`title`,`location`, `info`, `duration`, `creation_date`, `voting_end_date`) VALUES (?, ?, ?, ?, ?, ?)");

        if (!$stmt) {
            echo "Fehler beim Vorbereiten der Anweisung: (" . $this->mysqli->errno . ") " . $this->mysqli->error;
            die(); // Skript beenden bei Fehler
        }


        $stmt->bind_param("sssiss", $title, $location, $info, $duration, $creation_date, $voting_end_date);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public function getAppointment($appointment_id) {
        $stmt = $this->mysqli->prepare("SELECT * FROM `appointments` WHERE `appointment_id` = ?");
        $stmt->bind_param("i", $appointment_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            $appointment = new Appointment($row['appointment_id'], $row['title'], $row['location'], $row['info'], $row['duration'], $row['creation_date'], $row['voting_end_date']);
            $stmt->close();
            return $appointment;
        }
        $stmt->close();
        return null;
    }


    public function updateAppointment($appointment_id, $title, $location, $info, $duration, $creation_date, $voting_end_date) {
        $stmt = $this->mysqli->prepare("UPDATE `appointments` SET `title` = ?, `location` = ?, `info` = ?, `duration` = ?, `creation_date` = ?, `voting_end_date` = ? WHERE `appointment_id` = ?");

        if (!$stmt) {
            echo "Fehler beim Vorbereiten der Anweisung: (" . $this->mysqli->errno . ") " . $this->mysqli->error;
            die();
        }

        $stmt->bind_param("sssissi", $title, $location, $info, $duration, $creation_date, $voting_end_date, $appointment_id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
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
