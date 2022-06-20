import { functions } from "../firestore";
import { httpsCallable } from "firebase/functions";

const CloudApi = {
    helloWorld: (name) => {
        const _helloWorld = httpsCallable(functions, "helloWorld");
        const data = {"name": name};
        return _helloWorld(data);
    }
};

export { CloudApi };