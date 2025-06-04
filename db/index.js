import mongoose from "mongoose";

// 2 things db in another continent and db takes time
// therfore async await is must

const connectDB = async() => {
    try {
        const mongoDBconnection = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Mongo DB connected Succesfully with DB Host : ${mongoDBconnection.connection.host}`);
    } catch (error) {
        console.log("Connection Error", error);
        process.exit(1);
    }
}

export default connectDB;
