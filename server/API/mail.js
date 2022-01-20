import { UserModel} from "./Auth/index";
import { ItemsModel } from "./Items/index";
import nodemailer from "nodemailer";
import cron from "node-cron";

const mailTransporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'yohangupta123@gmail.com',
		pass: 'Ridergom&!89'
	}
});

const mailDetails = {
	from: 'yohangupta123@gmail.com',
	to: '',
	subject: '',
	text: ''
};

const details = {
    mTransporter : mailTransporter,
    mDetails : mailDetails    
}

// export default details;
module.exports = details
