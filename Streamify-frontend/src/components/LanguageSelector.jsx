import { useTranslation } from "react-i18next";
import { GlobeIcon } from "lucide-react";

const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "hi", name: "हिंदी" },
    { code: "ta", name: "தமிழ்" },
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" title="Change Language">
                <GlobeIcon className="h-6 w-6 text-base-content opacity-70" />
            </div>
            <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-36"
            >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <li key={lang.code}>
                        <button
                            onClick={() => changeLanguage(lang.code)}
                            className={i18n.language.startsWith(lang.code) ? "active" : ""}
                        >
                            {lang.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LanguageSelector;
