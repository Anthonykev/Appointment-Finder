<?php

Class Available_dates{

    public $date_id ;
    public $appointment_id;
    public $proposed_date;


    function __construct($date_id, $appointment_id, $proposed_date)
    {
    $this->date_id  = $date_id;
    $this->appointment_id  = $appointment_id;
    $this->proposed_date  =  $proposed_date ;
    }

    




}




?>