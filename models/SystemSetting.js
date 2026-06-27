import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // "home_banners" කියලා සෙට් කරමු
    slides: [
        { url: { type: String, required: true } } // ෆොටෝ 5 ලින්ක්ස් තියාගන්න
    ],
    adBanner: { type: String, required: true } // යට තියෙන ඇඩ් එකේ ලින්ක් එක
});

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);
export default SystemSetting;