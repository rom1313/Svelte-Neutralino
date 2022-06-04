function onWindowClose() {
    Neutralino.app.exit();
}



Neutralino.events.on('ready', () => {
    Neutralino.window.move((screen.width / 2) - 683, (screen.height / 2) - 384);

});
Neutralino.events.on("windowClose", onWindowClose);
Neutralino.init();
Neutralino.window.focus();
/* Neutralino.os.showMessageBox('Welcome', 'Hello Neutralinojs'); */
/*    await window.Neutralino.app.exit();
          await window.Neutralino.app.killProcess(); */
/*    await window.Neutralino.window.setDraggableRegion("jcjmode");
   await window.Neutralino.storage.setData(
       "userDetails",
       JSON.stringify({ username: "TestValue" })
   );
   window.Neutralino.os.open("https://apiildaa.herokuapp.com/");
   await window.Neutralino.os.showMessageBox("Hello", "Welcome");
   await window.Neutralino.os.showNotification(
       "Hello world",
       "It works!. Have a nice day"
   );
   await window.Neutralino.window.create("https://www.twitch.tv/tajgame13", {
       icon: "/www/img/vendre.png",
       enableInspector: false,
       width: 500,
       height: 300,
       maximizable: false,
       exitProcessOnClose: true,
       processArgs: "--window-id=W_ABOUT",
       resizable: true
   }); */

/*  await window.Neutralino.filesystem.writeFile("./myFile.txt", "Sample content");
await window.Neutralino.clipboard.writeText("hehe");
await window.Neutralino.app.restartProcess({ args: "--restarted" }); */

/* acceuil.scene.start("Acceuil", "Menuprincipal"); */
