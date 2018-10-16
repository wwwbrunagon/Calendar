import { Events, ModalController, NavController, NavParams, ViewController} from 'ionic-angular/';
import { Component } from '@angular/core';
//import { GoogleAnalytics } from 'ionic-native';
import { Subscription } from 'rxjs/Subscription';
import { POService } from '../../providers/poservice';
import { AppConfig } from '../../providers/appconfig';
import { Storage } from '../../providers/storage';
import { GAService } from '../../providers/gaservice';
import * as moment from 'moment';



/**
* CalendarComponent component
*/
@Component ({
  templateUrl: './calendar.html'
})
export class CalendarComponent {
  
  eventSource=[];
  viewTitle;
  isToday: boolean; 
  
  
  calendar = {
    mode: 'month',    
    //locale: ('pt-br'),
    //currentDate: new Date(),
  };
  
  public calendarPage: any = [];
  public infiniteScroll = null;
  public subscription: Subscription;
  public pager: any;
  
  
  constructor (public poService: POService,
    public nav: NavController,
    public params: NavParams,
    public appConfig: AppConfig,
    public events: Events,
    public modalCtrl: ModalController,
    public storage: Storage,
    public viewCtrl: ViewController,
    private gaService: GAService) {
      
      this.gaService.trackView ('CalendarComponent');
      this.gaService.trackEvent (this.viewCtrl.name, 'view_page', this.viewCtrl.name, 1);
      this.load(null, 1);      
    }
    
    
    onViewTitleChanged(title) {
      this.viewTitle = title;
    } 
    
    
    onTimeSelected(evt) {
      moment.locale("pt-br")
      console.log('Selected time: ' + evt.selectedTime + ', hasEvents: ' +
      (evt.events !== undefined && evt.events.length !== 0) + ', disabled: ' + evt.disabled);
      console.log( "new Date ()  >>> "+ moment(new Date().toISOString()).format('L'))
      
    }
   
    
    load (refresher, page: number) {
      moment.locale("pt-br"); 
      console.log("load chamando aqui")
      console.log(this.params.get ('id'), `&page=${page}`)
      let subscribe = this.poService
      .get_portlet_data (this.params.get ('id'), `&page=${page}`)      
      .subscribe (response => {
        console.log("response aqui >> " + JSON.stringify(response))
        
        let markedDay = new Date(); 
        let markedMonth = markedDay.getMonth()+1;
        let markedYear = markedDay.getFullYear();
        let urlj = response.source.dayswithocurrences;
        console.log(urlj);
        let path = `${urlj}month=${markedMonth}&year=${markedYear}`;
        path = encodeURIComponent(path);
        console.log(path)
        this.poService._do_get(path).subscribe (response => {
          console.log("poService  > > > RESPONSE  >> " + response);          
          
          let events = []
          let arr = response;
          let arrMap = arr.map(a => a+1); 

          console.log("calendário dias === " + arrMap)
          console.log(" Mês  === "+ markedMonth)
          console.log(" Ano  === "+ markedYear)

          for (let i = 0; i< arrMap.length; i++){

            let startTime = new Date(Date.UTC(markedDay.getUTCFullYear(), markedDay.getUTCMonth(),arrMap[i]));
            let endTime = new Date(Date.UTC(markedDay.getUTCFullYear(), markedDay.getUTCMonth(),arrMap[i]));  
            
            events.push({
              title: 'blablabalba',
              startTime: startTime,
              endTime: endTime,
              allDay: false
            })        
            
          }         
          this.eventSource = events;                            
          
        })      
        
        this.calendarPage = this.calendarPage.concat (response.calendarPage);
        this.pager = response.pager;  
        
        if (this.infiniteScroll) {
          this.infiniteScroll.complete ();
        }
        
      }, err => {
        this.events.publish ('dispatcher:err', err);
      });
      
      if (!this.infiniteScroll) {
        this.subscription = subscribe
      }
      
    } 
    
    
    //@param {object} infiniteScroll
    
    doInfinite (infiniteScroll) {
      this.infiniteScroll = infiniteScroll;
      this.load (null, this.pager.current_page + 1);
    }
    
    hasInfiniteScroll (): boolean {
      return this.pager && this.pager.current_page < this.pager.total_pages;
    }
    
  }
  
  
  
  //COLINHA >>> 
  // {calendar=[], source={dayswithocurrences=/workspace/calendar/calendar.view?method=searchContentsMonthOcurrences&startObjectId=7849&, ocurrencesbyday=/interface/}}
  
  // onEventSelected(event) {
  //   let start = moment(event.startTime).format('LLLL');
  //   let end = moment(event.endTime).format('LLLL');
  //   console.log("start" + start)
  //   console.log(end)
  // }
  
