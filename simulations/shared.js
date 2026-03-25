(function attachSharedUtils(global) {
    const PASSWORD_CHARACTERS = 36; 
    const PASSWORD_LENGTH = 5;

    function buildPasswordChoices(repetition) {
        const choices = [];
        for (let i = 0; i < PASSWORD_LENGTH; i += 1) {
            choices.push(repetition ? PASSWORD_CHARACTERS : PASSWORD_CHARACTERS - i);
        }
        return choices;
    }

    function multiply(values) {
        return values.reduce((acc, value) => acc * value, 1);
    }

    function factorial(value) {
        let total = 1;
        for (let i = 2; i <= value; i += 1) {
            total *= i;
        }
        return total;
    }

    function combination(n, k) {
        if (k < 0 || k > n) {
            return 0;
        }

        return factorial(n) / (factorial(k) * factorial(n - k));
    }

    global.AppShared = {
        PASSWORD_CHARACTERS,
        PASSWORD_LENGTH,
        buildPasswordChoices,
        multiply,
        combination,
    };
}(window));