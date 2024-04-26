<?php

class Votes {
    public $vote_id;
    public $date_id;
    public $user_name;
    public $comment;

  
    function __construct($vote_id, $date_id, $user_name, $comment) 
    {
        $this->vote_id = $vote_id;
        $this->date_id = $date_id;
        $this->user_name = $user_name;
        $this->comment = $comment;
    }

}


?>