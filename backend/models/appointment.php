<?php

Class Appointment
{

public $appointment_id;
public $title;
public $location;
public $info;
public $duration;
public $creation_date;
public $voting_end_date;

function __construct($appointment_id, $title, $location, $info, $duration, $creation_date, $voting_end_date  )
{
    $this->appointment_id = $appointment_id ;
    $this->title = $title ;
    $this->location = $location ;
    $this-> info= $info;
    $this-> duration= $duration;
    $this-> creation_date= $creation_date;
    $this-> voting_end_date= $voting_end_date;


}

}


?>