import {Component,OnChanges,Input,EventEmitter} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'date-picker',
    template: `
                <i class="fa fa-calendar" (click)='openDatePicker()'></i>
                <div class="datetimepicker datetimepicker-dropdown-bottom-right dropdown-menu" [style.display]="showDp"> 
                <table id="wp-calendar">
                    <caption>
                        <i class='icon-control-start' style='float:left' (click)='setPrevYear()'></i>
                        <i class='icon-arrow-left' style='float:left' (click)='setPrevMonth()'></i>
                        <label>{{currMonth}} {{currYear}}</label>
                        <i class='icon-control-end' style='float:right' (click)='setNextYear()'></i>
                        <i class='icon-arrow-right' style='float:right' (click)='setNextMonth(this)'></i>
                    </caption>
                    <thead>
                        <tr>
                            <th *ngFor="let day of daysofWeek">{{day}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let date of dates">
                            <td *ngFor="let d of date" (click)='setDate(d)' 
                                [class.disabled]='d.disabled' 
                                [class.selDate]='d.selected'
                                [class.empty]='d.empty'>{{d.date}}</td>
                        </tr>
                    </tbody>
                </table>
                </div>`,
	styleUrls: ['datepicker.css'],
	outputs: ['selectedDate']
})

export class DatePickerComponent implements OnChanges{
	@Input() formatDate:string='DD/MM/YYYY';
	@Input() minDate:string='01/01/1000';
    @Input() maxDate:string='31/12/9999';
    @Input() disableDays:Array<number>=[];
    @Input() toContainPrevMonth:boolean=true;
    @Input() toContainNextMonth:boolean=true;
    @Input() value:string;
	
	private daysofWeek:Array<String>;
	private currMonth:string;
	private currYear:string;
	private months:Array<String>;
	private dates:any=[];
	private completeDates:any;
	private tempArray:any;
	private prevMonth:string;
	private nextMonth:string;
	private prevYear:string;
	private nextYear:string;
	private showDp = 'none';
	public selectedDate = new EventEmitter();
		
	
	ngOnChanges() {
		if(this.value != null && this.value != '' && /(0[0-9]|1[0-9]|2[0-9]|3[01])[/](0[0-9]|1[012])[/][0-9]{4}/.test(this.value) == false)
			return;
        this.daysofWeek = ['Su','Mo','Tu','We','Th','Fr','Sa'];
		this.months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		this.currMonth = this.months[new Date().getMonth()].toString();
		this.currYear = new Date().getFullYear().toString();
		//Set previous and next months
        if(this.currMonth == "Jan")
		    this.prevMonth = 'Dec';
        else 
            this.prevMonth = this.months[new Date().getMonth()-1].toString();
        if(this.currMonth == 'Dec')
		    this.nextMonth = 'Jan';
        else 
            this.nextMonth = this.months[new Date().getMonth()+1].toString();
		this.prevYear = (parseInt(this.currYear) - 1).toString();
		this.nextYear = (parseInt(this.currYear) + 1).toString();
		//Set Date Array
        if (this.value!='' && this.value != null && this.value != "00/00/0000") {
            let givenDate = moment(this.value,this.formatDate,true);
			if(isNaN(givenDate.month()) && isNaN(givenDate.year()) && isNaN(givenDate.date())){
				this.dates = this.setDateArray(this.currMonth,this.currYear,'');
			}else{
            	this.currMonth = this.months[givenDate.month()].toString();
            	this.currYear = givenDate.year().toString();
            	this.dates = this.setDateArray(this.currMonth,this.currYear,givenDate.date());    
			}
        }
        else {
            this.dates = this.setDateArray(this.currMonth,this.currYear,'');
        }
				
	}

	openDatePicker() {
		if (this.showDp=='none')
			this.showDp = 'block';
		else
			this.showDp = 'none';	
	}

	setPrevMonth() {
		this.nextMonth = this.currMonth;
		this.currMonth = this.prevMonth;
		//Set new previous month
		let tempDate = new Date(this.currMonth+'/'+'1'+'/'+this.currYear);
        if (this.currMonth=='Jan'){
			//Set previous month to December
			this.prevMonth = this.months[11].toString();
		}
		else
			this.prevMonth = this.months[tempDate.getMonth() - 1].toString();
		if (this.currMonth=='Dec') {
			//Set current year to previous year
			this.currYear = this.prevYear;
			this.prevYear = (parseInt(this.currYear) - 1).toString();
			this.nextYear = (parseInt(this.currYear) + 1).toString();
		}	
		//Set Date Array to previous month
		this.dates = this.setDateArray(this.currMonth,this.currYear,'');
	}

	setNextMonth() {
		this.prevMonth = this.currMonth;
		this.currMonth = this.nextMonth;
		//Set new next month
		let tempDate = new Date(this.currMonth+'/'+'1'+'/'+this.currYear);
		if (this.currMonth=='Dec'){
			//Set next month to January
			this.nextMonth = this.months[0].toString();
		}
		else
			this.nextMonth = this.months[tempDate.getMonth() + 1].toString();
		if (this.currMonth=='Jan') {
			//Set current year to previous year
			this.currYear = this.nextYear;
			this.prevYear = (parseInt(this.currYear) - 1).toString();
			this.nextYear = (parseInt(this.currYear) + 1).toString();
		}	
		//Set Date Array to next month
		this.dates = this.setDateArray(this.currMonth,this.currYear,'');
	}

	setDateArray(month,year,date):any{
		
		let tempLastDate = this.decideDate(month,year);
		let temp = [];
		for (let i=1;i<=tempLastDate;i++){
            let currentDate = moment().year(year).month(month).date(i);
            let pastDate = moment(this.minDate);
            let futureDate = moment(this.maxDate).add(1, 'd');
            let dbld = false;
            //To disable Days - Index based 0-6
            for (let dayIndex=0; dayIndex<this.disableDays.length; dayIndex++){
                if (currentDate.day()==this.disableDays[dayIndex]) {
                    dbld = true;
                }
            }
            if (currentDate.isBefore(this.minDate) || currentDate.isAfter(futureDate)) {
                dbld = true;
            }
			if (i!=date)
				temp.push({'month':this.months.indexOf(month)+1,'date':i,'disabled':dbld,'selected':false,'empty':false});	
			else
				temp.push({'month':this.months.indexOf(month)+1,'date':i,'disabled':dbld,'selected':true,'empty':false});	
		}
		this.completeDates = temp;	

		//Determine Date of First of the Month
		let firstDate = new Date(month+'/'+'1'+'/'+year);
		let lastDate = new Date(month+'/'+tempLastDate+'/'+year);
		
		//Prepend Prev Month Dates
		let spaceArray=[];
		if (firstDate.getDay()!=0){
			//Not Sunday
			let pMonth = this.months.indexOf(month)-1;
			let prevLast = this.decideDate(this.months[pMonth],year);
			//Fix it to display last date last
			for (let i=0;i<firstDate.getDay();i++)
			{
                if (this.toContainPrevMonth) {
                    spaceArray.push({'month':firstDate.getMonth()-1,'date':prevLast,'disabled':true,'selected':false,'empty':false});
                }
                else {
                    spaceArray.push({'month':'','date':'','disabled':false,'selected':false,'empty':true});
				}
				prevLast--;
			}
		}
		this.tempArray = spaceArray.reverse().concat(this.completeDates);
		//Append Next Month Dates
		if (lastDate.getDay()!=6){
			//Not Saturday
			let nIndex = 1;
			for (let i=6;i>lastDate.getDay();i--){
                if (this.toContainNextMonth) {
                    this.tempArray.push({'month':firstDate.getMonth()+1,'date':nIndex,disabled:true,'selected':false,'empty':false});
                }
                else {
                    this.tempArray.push({'month':'','date':'',disabled:false,'selected':false,'empty':true});
				}
				nIndex++;
			}
		}
		
		let tempDateChild=[];
		let tempDateMain=[];
		for (let date in this.tempArray){
			if ((parseInt(date)+1)%7 == 0){
				tempDateChild.push(this.tempArray[date]);
				tempDateMain.push(tempDateChild);
				tempDateChild=[];
			}
			else{
				tempDateChild.push(this.tempArray[date]);
			}
		}
		return tempDateMain;

	}
    setPrevYear(){
        this.currYear = (parseInt(this.currYear) - 1).toString();
        this.dates = this.setDateArray(this.currMonth,this.currYear,'');
    }
    setNextYear(){
        this.currYear = (parseInt(this.currYear) + 1).toString();
        this.dates = this.setDateArray(this.currMonth,this.currYear,'');
    }

	decideDate(month,year):number{
		let last = 31;
		switch (month){
			case 'Feb':{
				//Feb
				last = 28;
				if ((parseInt(year)%4) == 0)
					last = last + 1;
			} 
			break;
			case 'Apr' : 
			case 'Jun' :
			case 'Sep' :
			case 'Nov' :{
				//April, June, September, November 
				last = 30;
			} 
			break;
			default : break;
		}
		return last;
	}

	setDate(sDate) {
		if (!sDate.disabled){
			if (sDate.date!=''){
				//Set the new date array with active date
				this.dates = this.setDateArray(this.currMonth,this.currYear,sDate.date);
                let selDate = moment().year(parseInt(this.currYear)).month(this.currMonth).date(parseInt(sDate.date)).format(this.formatDate);
				this.selectedDate.next(selDate);
				this.value = selDate;
			}
		}
		
		this.openDatePicker();
	}

}