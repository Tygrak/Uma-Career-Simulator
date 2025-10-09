export class Parent {
    name = "";
    sparkAttribute = 0;
    sparkLevel = 0;

    static fromString(str: string): Parent {
        let parent = new Parent();
        let match = str.match(/(.+)(\d)/);
        let type = match![1];
        let level = match![2];
        if (type == "speed") {
            parent.sparkAttribute = 0;
        } else if (type == "stamina") {
            parent.sparkAttribute = 1;
        } else if (type == "power") {
            parent.sparkAttribute = 2;
        } else if (type == "guts") {
            parent.sparkAttribute = 3;
        } else {
            parent.sparkAttribute = 4;
        }
        parent.sparkLevel = parseInt(level!);
        return parent;
    }
}
