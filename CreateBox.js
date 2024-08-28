import chalk from "chalk";

export async function CreateBox(notebookName) {
    var topLine = "";
    var bottomLine = "";
    for (var i = 0; i < notebookName.length + 6; i++) {
        topLine += "_";
        bottomLine += "-";

    }
    console.log(chalk.blue(topLine));
    for (var i = 0; i < 3; i++) {
        if (i == 1) {
            console.log(chalk.blue("|  ") + chalk.red.bold(notebookName) + chalk.blue("  |"));
        } else {
            console.log(chalk.blue("|  " + " ".repeat(notebookName.length) + "  |"));
        }
    }
    console.log(chalk.blue(bottomLine));
}