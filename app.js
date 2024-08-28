import chalk from "chalk";
import inquirer from "inquirer";
import figlet from "figlet";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from 'url';
import { translateText } from "./translate.js";
import { CreateBox } from "./CreateBox.js";

// TODO:
// - Create target language dropdown for translation
// - Create option to save translation to note
// - Beautify the CLI
// - View + edit note efficiently

//get path to file
const __filename = fileURLToPath(import.meta.url);
//get name of current directory
const __dirname = path.dirname(__filename);
//base directory path to store all notebooks
const baseDir = path.join(__dirname, 'notebooks');

const getNotebookPath = (notebookName) => path.join(baseDir, notebookName);
const getNotePath = (notebookName, noteName) => path.join(baseDir, notebookName, noteName + '.txt');

const resolveAnimations = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//main menu for the app
async function startNotebook() {
    //Welcome message
    figlet('NotebookCLI', {
        font: 'doom'
    }, function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(chalk.green.bold(data));
        console.log(chalk.green.bold('Welcome to the NotebookCLI!'));
        console.log(chalk.green(`Let's get started!\n`));
    });

    await resolveAnimations(1000);

    //show available notebooks
    const notebooks = fs.readdirSync(baseDir);
    if (notebooks.length > 0) {
        console.log(chalk.blue('Your notebooks: '));
        for (var i = 0; i < notebooks.length; i++) {
            CreateBox(notebooks[i]);
        }
    } else {
        console.log(chalk.yellow('No notebooks available. Get started by creating a new notebook!'));
    }
    console.log("\n");

    await resolveAnimations(1000);

    //display options (main menu)
    const answers = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: 'Create a new notebook', value: 'createNotebook' },
                { name: 'Open an existing notebook', value: 'openNotebook' },
                { name: 'Exit', value: 'exit' }
            ]
        }
    ]);

    await actionChoice(answers.action);
}

//actions in main menu
async function actionChoice(choice) {
    if (choice === 'createNotebook') {
        await createNotebook();
    } else if (choice === 'openNotebook') {
        await openNotebook();
    } else {
        console.log(chalk.red('Goodbye!'));
        process.exit();
    }
} 

//create a new notebook
async function createNotebook() {
    const answers = await inquirer.prompt({
        name: 'notebook_name_create',
        type: 'input',
        message: 'Please enter the new notebook name.'
    });
    const notebookName = answers.notebook_name_create;
    const notebookPath = getNotebookPath(notebookName);
    try {
        if (!fs.existsSync(notebookPath)) {
            fs.mkdirSync(notebookPath);
            console.log(chalk.green(`Notebook "${notebookName}" created!`));
        } else {
            console.log(chalk.yellow(`Notebook "${notebookName}" already exists.`));
        }
    } catch (err) {
        console.error(chalk.red(`Error creating notebook: ${err}`));
    }
    console.log("\n\n");
    await startNotebook();
}

//open an existing notebook
async function openNotebook() {
    const answers = await inquirer.prompt({
        name: 'notebook_name',
        type: 'input',
        message: 'Please enter the notebook name.'
    });
    const notebookName = answers.notebook_name;
    const notebookPath = getNotebookPath(notebookName);
    if (fs.existsSync(notebookPath)) {
        console.log(chalk.yellow(`Notebook "${notebookName}" opened!\n`));
        // const notes = fs.readdirSync(notebookPath).filter(file => file.endsWith('.txt'));

        // if (notes.length > 0) {
        //     console.log(chalk.blue(`Your available notes in notebook "${notebookName}`));
        //     for (var i = 0; i < notes.length; i++) {
        //         console.log(chalk.red.bold(`${i+1}. ${path.basename(notes[i], '.txt')}`));
        //     }
        // } else {
        //     console.log(chalk.yellow("No notes available in this notebook. Create a new note to get started!"));
        // }
        // console.log("\n");
        await manageNotes(notebookName, notebookPath);
    } else {
        console.log(chalk.red(`Notebook "${notebookName} does not exist.`));
    }
    console.log("\n\n");
    await startNotebook();
}

//menu in the notebook level when you open a notebook
async function manageNotes(notebookName, notebookPath) {
    console.log(chalk.bold.green(`Notebook: "${notebookName}" Menu`));

    const notes = fs.readdirSync(notebookPath).filter(file => file.endsWith('.txt'));
    if (notes.length > 0) {
        console.log(chalk.blue(`Your available notes in notebook "${notebookName}`));
        for (var i = 0; i < notes.length; i++) {
            console.log(chalk.red.bold(`${i+1}. ${path.basename(notes[i], '.txt')}`));
        }
    } else {
        console.log(chalk.yellow("No notes available in this notebook. Create a new note to get started!"));
    }
    console.log("\n");

    const answers = await inquirer.prompt([{
        type: 'list',
        name: 'notes_action',
        message: 'What would you like to do?',
        choices: [
            { name: 'Create a new note', value: 'createNote' },
            { name: 'View and edit a note', value: 'viewNote' },
            { name: 'Delete a note', value: 'deleteNote' },
            { name: 'Back to main menu', value: 'back'}
        ]
    }]);

    const notesAction = answers.notes_action;
    if (notesAction === 'createNote') {
        await createNote(notebookName, notebookPath);
    } else if (notesAction === 'viewNote') {
        await viewAndEditNote(notebookName, notebookPath);
    } else if (notesAction === 'deleteNote') {
        await deleteNote(notebookName, notebookPath);
    } else if (notesAction === 'back') {
        await startNotebook();
    } 
}

//create a new note in the current notebook
async function createNote(notebookName, notebookPath) {
    const answers = await inquirer.prompt({
        name: 'note_title',
        type: 'input',
        message: 'Please enter the note title to create:'
    });
    const noteTitle = answers.note_title;
    const notePath = getNotePath(notebookName, noteTitle);
    try {
        if (!fs.existsSync(notePath)) {
            fs.writeFileSync(notePath, '');
            console.log(chalk.green(`Note "${noteTitle}" created!`));
        } else {
            console.log(chalk.yellow(`Note "${noteTitle}" already exists.`));
        }
    } catch (err) {
        console.error(chalk.red(`Error creating note: ${err}`));
    }
    await resolveAnimations(1000);
    console.log("\n\n");
    await manageNotes(notebookName, notebookPath);
}

//view and edit an existing note in the current notebook (edit and translate features)
async function viewAndEditNote(notebookName, notebookPath) {
    // Prompt for note title
    const answers1 = await inquirer.prompt({
        name: 'note_title',
        type: 'input',
        message: 'Please enter the note title to view and edit:'
    });
    const noteTitle = answers1.note_title;
    const notePath = getNotePath(notebookName, noteTitle);

    try {
        if (fs.existsSync(notePath)) {
            // Read the existing note content
            const existingContent = fs.readFileSync(notePath, 'utf-8');

            // Display the existing note content
            console.log(chalk.blue(`Current content of "${noteTitle}":`));
            console.log(chalk.yellow(existingContent));
            await resolveAnimations(1000);

            // Ask if the user wants to edit the note
            const answers2 = await inquirer.prompt({
                name: 'edit_action',
                type: 'list',
                message: 'What would you like to do?',
                choices: [
                    { name: 'Edit this note', value: 'editNote' },
                    { name: 'Translate this note', value: 'translateNote' },
                    { name: 'Back to your notebook menu', value: 'return'}
                ]
            });
            
            const editAction = answers2.edit_action;

            if (editAction === 'editNote') {
                // Prompt for note content with editor, pre-filling existing content
                const { noteContent } = await inquirer.prompt({
                    name: 'noteContent',
                    type: 'editor',
                    message: 'Edit the note content.',
                    default: existingContent
                });

                // Write the edited content to the file
                fs.writeFileSync(notePath, noteContent);
                console.log(chalk.yellow(`Note "${noteTitle}" updated.`));
            } else if (editAction === 'translateNote') {
                await translateNote(noteTitle, notePath);
            } else if (editAction === 'return') {
                console.log(chalk.yellow('No changes made to the note.'));
            }
        } else {
            console.log(chalk.red(`Note "${noteTitle}" does not exist.`));
        }
    } catch (err) {
        console.error(chalk.red(`Error handling note: ${err}`));
    }
    await resolveAnimations(1000);
    console.log("\n\n");
    await manageNotes(notebookName, notebookPath);
}

//delete a note in the current notebook
async function deleteNote(notebookName, notebookPath) {
    console.log("Deleting!");
    const answers = await inquirer.prompt({
        name: 'note_title',
        type: 'input',
        message: 'Please enter the note title to delete:'
    });
    const noteTitle = answers.note_title;
    const notePath = getNotePath(notebookName, noteTitle);

    try {
        if (fs.existsSync(notePath)) {
            fs.removeSync(notePath);
            console.log(chalk.yellow(`Note "${noteTitle}" deleted successfully!`));
        } else {
            console.log(chalk.red(`Note "${noteTitle}" does not exist.`));
        }
    } catch (err) {
        console.error(chalk.red(`Error deleting note: ${err}`));
    }
    await resolveAnimations(1000);
    console.log("\n\n");
    await manageNotes(notebookName, notebookPath);
}

//translate note 
async function translateNote(noteTitle, notePath) {
    // const answers = await inquirer.prompt({
    //     name: 'note_title',
    //     type: 'input',
    //     message: 'Please enter the note title to translate.'
    // });
    // const noteTitle = answers.note_title;
    // const notePath = getNotePath(notebookName, noteTitle);
    const targetLang = 'es';
    try {
        if (fs.existsSync(notePath)) {
            const text = fs.readFileSync(notePath, 'utf-8');
            const translation = await translateText(text, targetLang);
            console.log(chalk.yellow(`Note "${noteTitle}": ${translation}`));
        } else {
            console.log(chalk.red(`Note "${noteTitle}" does not exist.`));
        }
    } catch (err) {
        console.error(chalk.red(`Error translating note: ${err}`));
    }
}


async function main() {
    await startNotebook();
}

main();