import express from "express";
import SystemSetting from "../models/SystemSetting.js";
import authenticate from "../middlewares/authenticate.js"; // ⚠️ උඹේ Auth Middleware එකේ නම දාන්න

const settingRouter = express.Router();

// 🌍 1. හැමෝටම බැනර් ලින්ස් බලන්න දෙන GET රූට් එක (කාටත් පේන්න)
settingRouter.get("/banners", async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({ key: "home_banners" });
        
        // ඩේටාබේස් එකේ තවම මුකුත් නැත්නම් ඩිෆෝල්ට් ටෙක්ට් ෆොටෝ 5ක් ක්‍රියේට් කරනවා
        if (!settings) {
            settings = new SystemSetting({
                key: "home_banners",
                slides: [
                    { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1200&q=80" },
                    { url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" },
                    { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80" },
                    { url: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?auto=format&fit=crop&w=1200&q=80" },
                    { url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80" }
                ],
                adBanner: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80"
            });
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 🔒 2. ඇඩ්මින්ට විතරක් බැනර්ස් අප්ඩේට් කරන්න දෙන POST රූට් එක
settingRouter.post("/banners", authenticate, async (req, res) => {
    // ලොග් වෙලා ඉන්න එකා ඇඩ්මින් කෙනෙක්ද කියා බැලීම
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Forbidden. Admin access required." });
    }

    try {
        const { slides, adBanner } = req.body;

        let settings = await SystemSetting.findOne({ key: "home_banners" });
        if (settings) {
            settings.slides = slides;
            settings.adBanner = adBanner;
            await settings.save();
        } else {
            settings = new SystemSetting({ key: "home_banners", slides, adBanner });
            await settings.save();
        }

        res.json({ message: "Banners updated in Database successfully!", settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default settingRouter;