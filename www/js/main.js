function onWindowClose() {
    Neutralino.app.exit();
}



Neutralino.events.on('ready', () => {
    Neutralino.window.move(0, 0);

});
Neutralino.events.on("windowClose", onWindowClose);
Neutralino.init();
Neutralino.window.focus();
/* Neutralino.os.showMessageBox('Welcome', 'Hello Neutralinojs'); */
