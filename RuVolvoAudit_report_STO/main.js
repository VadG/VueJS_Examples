Vue.component('app-select', {
    props: ['data','val','arrkey','multiple'],
    template: `
            <select  class="form-control"  :multiple ='multiple' @input = 'onUpdate($event)' >
            <option  value="0"
            	    :selected= "val[0] == 0"
            	     disabled>
              			Выберите один из вариантов
             </option>
            <option v-for="(elem,index) in data" 
            		:selected= "val.indexOf(elem[arrkey])!==-1"
            	    :value = "elem[arrkey]">
             			 {{elem[arrkey]}}
            </option>
            </select>
            `,
            data:()=>({           
             }),
            methods:{
                onUpdate({target}){
                    let values = [...target.options].filter(option => option.selected).map(option => option.value);
                    this.$emit('select_changed',values,this.arrkey)

                }
                 
            }
})

 new Vue({
    el: '#app',
    data: {
        selectedYear: [0],
        selectedCity: [0],
        selectedTests: [],
        years: [],
        citys: [],
        tests: [],
        results:[]
    },
    computed: {
        isYearSelected() {
            return !this.selectedYear[0]==0;
        },
        isCitySelected() {
            return !this.selectedCity[0]==0;
        },
        isResultsLoaded(){
            return !this.results.length == 0;
        },
        allSelected(){
            return !(this.isCitySelected&&this.isYearSelected&&this.selectedTests.length!==0);
        },
        allAnkets(){
            let ankets = new Set();
              this.results.map(el=>ankets.add(el.ankName))
              return Array.from(ankets)
        },
        allDealers(){
              let dealers = new Set();
            this.results.map(el=>dealers.add(el.Name))
            return Array.from(dealers)
        },
        newResults(){
            let result = [];
            this.allDealers.forEach(d => {
                let correntDealer = {};
                correntDealer.Name = d;
                correntDealer.Ankets = [];
                correntDealer.EffSumm = 0;
                this.allAnkets.forEach(a => {
                    let currentAnket = {};
                    currentAnket.Name = a;
                    this.results.forEach(bf => {
                        if (bf.Name == d && bf.ankName == a) {
                            currentAnket.Eff = bf.Effectiveness;
                            correntDealer.EffSumm += +bf.Effectiveness;
                        }
                    });
                    correntDealer.Ankets.push(currentAnket);
                });
                result.push(correntDealer);
            });
            return result;
        }
    },
    methods: {
        getData(url='',paramObj={}){
            return fetch(url,paramObj)
            .then(data => data.json())
            .catch(err => Promise.reject(err)) 
        },
        updateSelectedValues(newValues,key){
           switch (key){
                 case 'WaveYear':
                     this.selectedYear = newValues;
                     this.selectedCity=[0];
                     this.tests=[];
                     this.results=[];
                     break;
                case 'City':
                    this.selectedCity =  newValues;
                    this.tests=[];
                    this.results=[];
                    break;
           }
        },
        sendFormData(){
         let testsValues = this.selectedTests.join(',')                  
         let form = new FormData();
          form.append('City', this.selectedCity);
          form.append('Year', this.selectedYear);
          form.append('Tests', testsValues);
         let loadTestResults = this.getData('https://api.myjson.com/bins/z3uou',
                    {credentials: "same-origin",
                      method: "GET"
                    }
                )
            loadTestResults.then(json=>this.results = json);
        }
    },
    beforeMount() { 
        let loadYears = this.getData('https://api.myjson.com/bins/vj926',{credentials: "same-origin",method: "GET"})
            loadYears.then(json => this.years = json);
    },
    watch: {
        selectedYear() {
             
            let loadCitys =  this.getData(`https://api.myjson.com/bins/btsxq`,{credentials: "same-origin",method: "GET"})
                loadCitys.then(json => this.citys = json)
        },
        selectedCity() {
            if (this.isCitySelected) {
                 this.selectedTests = [];
                  let form = new FormData();
                  form.append('selectedCity', this.selectedCity.join(','));
              let loadTests = this.getData(`https://api.myjson.com/bins/mlqzi`,

                     {credentials: "same-origin",
                      method: "GET" 
                    }
                )
                loadTests.then(json => this.tests = json)
            }
            
        }
      

    }
});