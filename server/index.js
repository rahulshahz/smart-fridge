require("dotenv").config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

//Routes
import Auth from "./API/Auth";
import Items from "./API/Items";

//Databse Connection
import ConnectDB from "./database/connection";

//to initialize express in zomato
const app = express();
import itemsRoutes from "./API/Items/index.js"
import cron from "node-cron";
import { UserModel } from "./database/user/index"
import { FridgeModel } from "./database/fridge/index"
import details from "./API/mail"

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use('/', itemsRoutes)

//route
app.get("/", (req, res) => {
    res.json({ message: "Setup Success" });
});

app.use("/auth", Auth);
app.use("/", Items);

//Email Scheduler
cron.schedule('0 * * * * *', async () => {
    console.log("scheduler running...")
	UserModel.find({}, (err, users) => {
        if(err){
            console.log("No User in user table")
        }else{
            users.map(allUser => {
                FridgeModel.findOne({user : allUser._id}, (err, reqUser) => {
                            if(reqUser !== null){
                                console.log(reqUser.user)
                                try{
                                    reqUser.food.map(items => {
                                        const expDate = items.date;
                                        const curr = new Date();
                                        
                                        const newExp = new Date(expDate - 3*24*60*60*1000);  
                                        
                                        if(curr >= newExp){
                                            console.log(`${items.name} expired`)
                                            UserModel.findById({_id : reqUser.user}, (error, res) => {
                                                if(error){
                                                    console.log("No User")
                                                }else{
                                                    details.mDetails.to = res.email;
                                                    details.mDetails.text = `{Your ${items.name} are about to expire on ${expDate}, To find the receipes on ${items.name} visit your EatIt account}`
                                                    details.mTransporter.sendMail(details.mDetails, function(errs, data){
                                                        console.log("before")
                                                        if(errs) {
                                                            console.log('Error Occurs' + errs );
                                                        }else {
                                                            console.log('Email sent : ' + data.response);
                                                        }
                                                        console.log("after")
                                                    });
                                                }
                                            })
                                        }
                                            else{
                                            console.log(`${items.name} not expired`)
                                        }
                                    })
                                }
                                catch(e){
                                    console.log("Error caught in try catch")
                                }
                            }else{
                                console.log("No user in fridge table")
                            }
                });
            });
           
        }      
        
    });

});

app.listen(
    4001,
    ConnectDB()
        .then(() => console.log("Server is up and running"))
        .catch(() =>
            console.log("Server is running, but database connection failed .")
        )
);
