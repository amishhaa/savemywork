/**
* Create a Answer.
* @param {string} type - The type value.
* @param {Object[]} heuristicAnswers  - An array of HeuristicAnswer value.
* @param {Object[]} taskAnswers  - An array of TaskAnswer value.
* @param {object[]} interactions - An array of Interactions
*/

export default class Answer {
    constructor({
        type,
        heuristicAnswers,
        taskAnswers,
        interactions
    } = {},
    ) {
        this.type = type
        this.heuristicAnswers = heuristicAnswers
        this.taskAnswers = taskAnswers
        this.interactions = interactions
    }
    static toAnswer(data) {
        return new Answer(data)
    }

    toFirestore() {
        return {
            type: this.type ?? '',
            heuristicAnswers: this.heuristicAnswers ?? {},
            taskAnswers: this.taskAnswers ?? {},
            interactions: this.interactions ?? {},
        }
    }
}