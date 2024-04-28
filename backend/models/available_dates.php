<?php

Class Available_dates{

    public $date_id ;
    public $appointment_id;
    public $proposed_date;

    public $vote_start_date;
    public $vote_end_date;


    function __construct($date_id, $appointment_id, $proposed_date, $vote_start_date, $vote_end_date)
    {
    $this->date_id  = $date_id;
    $this->appointment_id  = $appointment_id;
    $this->proposed_date  =  $proposed_date ;
    $this->vote_start_date = $vote_start_date;
    $this->vote_end_date = $vote_end_date;
    }

    




}




?>