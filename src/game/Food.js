export class Food {
    constructor(board) {
        this.board = board;
        this.x = 0;
        this.y = 0;
        this.type = 'normal';
        this.value = 10;
        this.color = '#ffff41'; // Yellow
    }
    
    spawn(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        
        // Set properties based on food type
        switch (type) {
            case 'normal':
                this.value = 10;
                this.color = '#ffff41';
                break;
            case 'bonus':
                this.value = 25;
                this.color = '#ff41ff';
                break;
            case 'super':
                this.value = 50;
                this.color = '#41ffff';
                break;
        }
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    getValue() {
        return this.value;
    }
    
    getColor() {
        return this.color;
    }
}