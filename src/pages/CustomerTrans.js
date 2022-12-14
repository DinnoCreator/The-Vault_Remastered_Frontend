import React from "react";
import MainNavigation from "../components/Layout/MainNavigation";
import { useState, useCallback } from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import moment from "moment";

const CustomerTransaction = () => {
    const location = useLocation();
  //  Authentication
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [tansactionDetail, setTransactionDetails] = useState([]);

  // sets location and navigation
  let navigate = useNavigate();

  // Checks if user is authenticated
  const getUser = useCallback(async () => {
    try {
      await fetch(`https://thevault-api.onrender.com/custran/${location.state}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (res.status === 200) {
            return res.json();
          }
        })
        .then(function (jsonData) {
          setIsAuthenticating(false);
          return setTransactionDetails(jsonData.transactions);
        });
    } catch (err) {
      console.error(err.message);
    }
  }, [location.state, setTransactionDetails]);
  useEffect(() => {
    getUser();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [getUser]);

  const printHandler = () => {
    return window.print();
  };

  if (isAuthenticating && tansactionDetail.length === 0) {
    // Result when user is still being authenticated
    return (
      <div className="center">
        <div></div>
        <div
          style={{ display: "inline-block" }}
          className="loaderBig pushDownBig"
        ></div>
      </div>
    );
  } else if (!isAuthenticating && tansactionDetail.length === 0) {
    return (
      <>
        <MainNavigation />
        <div className="cardi">
          <h1>Nothing to show...</h1>
        </div>
      </>
    );
  } else {
    const transacts = tansactionDetail.map((tansactionDetails) => {
      return (
        <div className="container">
          {/* <div className="col-lg-12 pushDownMid1"> */}
          <div class="card text-center pushDownMid1 shadowB" id="roborobo1">
            <div
              class="card-header"
              style={{
                color:
                  tansactionDetails.transaction_status === "Successful"
                    ? "green"
                    : "red",
              }}
            >
              {tansactionDetails.transaction_status}...
            </div>
            <div class="card-body">
              <em>
                <h6>ID: {tansactionDetails.parent_transaction_id}</h6>
              </em>
              {tansactionDetails.transaction_status === "Successful" ? (
                <h5
                  class="card-title"
                  style={{
                    color:
                      tansactionDetails.transaction_type === "Credit"
                        ? "green"
                        : "red",
                  }}
                >
                  {" "}
                  {tansactionDetails.transaction_type} of N
                  {Number(
                    tansactionDetails.transaction_amount
                  ).toLocaleString()}
                </h5>
              ) : (
                <h5 class="card-title">
                  {tansactionDetails.transaction_type} of N
                  {Number(
                    tansactionDetails.transaction_amount
                  ).toLocaleString()}
                </h5>
              )}

              <p class="card-text bolder" style={{ paddingTop: "0" }}>
                From
                <br /> {tansactionDetails.s_account}
                <br />
                {tansactionDetails.s_account_no} <br />
                To
                <br /> {tansactionDetails.r_account} <br />
                {tansactionDetails.r_account_no} <br />
              </p>
              <div
              class="card-header"
              style={{
                display:
                  tansactionDetails.transaction_status === "Failed"
                    ? "none"
                    : "block",
              }}
              >
              <button className="btn blueViolet shadowB" type="button" 
              onClick={async (e) => {
                try {
                  const id = tansactionDetails.parent_transaction_id;

                  await fetch("https://thevault-api.onrender.com/reverse", {
                    method: "DELETE",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id,
                    }),
                  }).then((res) => {
                    if (res.status === 200) {
                      res.json();
                      return navigate("/status", { state: "Deleted" });
                    }
                  });
                } catch (error) {
                  console.error(error);
                }
              }}> Reverse Transaction</button>
             </div>
            </div>
            <div class="card-footer text-muted">
              Date:{" "}
              <strong>
                {moment(tansactionDetails.transaction_date).format(
                  "MMMM Do YYYY"
                )}
              </strong>{" "}
              &nbsp;&nbsp;Time:{" "}
              <strong>{tansactionDetails.transaction_time}</strong>
            </div>
          </div>
          {/* </div> */}
        </div>
      );
    });

    return (
      // Display when user is authenticated and has more than 1 account
      <>
        <MainNavigation />
        <div className="container" style={{ paddingTop: "1%" }}>
          <button
            className="btn btn-primary shadowB"
            type="button"
            onClick={printHandler}
          >
            Print bank statement
          </button>
        </div>
        {transacts}
      </>
    );
  }
}

export default CustomerTransaction;
