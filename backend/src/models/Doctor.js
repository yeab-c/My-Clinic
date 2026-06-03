import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true }
);

const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);

export default Doctor;