import { Command } from 'some-command-library'; // Adjust based on the existing imports

const hadukenCommand: Command = {
    name: '/haduken',
    description: 'Executes a haduken command with a random chance.',
    execute: (interaction) => {
        const randomChances = Math.random(); // Generates a random number between 0 and 1
        if (randomChances < 0.01) { // 1/100 chance
            return interaction.reply('VAI TER HADUKEN!');
        } else {
            return interaction.reply('ERROU!');
        }
    },
};

export default hadukenCommand;