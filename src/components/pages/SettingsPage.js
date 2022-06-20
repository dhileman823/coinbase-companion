import {CloudApi} from "../../util/CloudApi";

function SettingsPage(){

    const sayHello = async () => {
        const result = await CloudApi.helloWorld("Tester");
        alert(result.data.msg);
    };

    return (
        <div className="page">settings page <button onClick={sayHello}>Hello</button></div>
    );
}

export default SettingsPage;