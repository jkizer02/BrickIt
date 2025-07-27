import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";


export default function Home() {


  return (
    <div className="container-fluid">
      <div className="py-4">
        <h1 className="text-center">Welcome to BrickIt</h1>
        <p className="text-center">Your one-stop solution for designing your LEGO creations!</p>
        <div className="text-center">
          <Link to="/generate" className="btn btn-primary">Generate LEGO Model</Link>
          <Link to="/tour" className="btn btn-secondary ms-2">Quick Tour</Link>
        </div>
      </div>
    </div>
  );
}