import { useHtml } from "nukejs"

export default function Index() {
    useHtml({
        bodyAttrs: {
            style: "margin: 0;height: 100vh;display: flex;justify-content: center;horizontal center;align-items: center;"
        }
    })
    return <div style={{ flex: "row" }}><img src="/nuke.png" /><h2>Welcome to NukeJS</h2></div>
}