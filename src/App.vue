<style lang="scss">
// Import Bulma's core
@import "~bulma/sass/utilities/_all";

$desktop: 550px;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";
</style>

<template>
  <div id="app" class="container my-5">

    <section class="block has-text-right">
      <b-dropdown position="is-bottom-left" append-to-body aria-role="menu">
        <button class="button is-small is-info" 
                slot="trigger" 
                outlined>
          <span>Edit an existing signup</span>
          <b-icon icon="menu-down"></b-icon>
        </button>

         <b-dropdown-item
           aria-role="menu-item"
           :focusable="false"
           custom
           paddingless>
           <form action="">
            <div class="modal-card" 
                 ref="lookup" 
                 style="width:300px;">
              <section class="modal-card-body">
                <section>
                  <b-field :type="lookupFieldType"
                           :message="lookupErrorMessage">
                    <b-input v-model="lookupId" 
                             placeholder="Signup ID"
                             @input="clearLookupField">
                    </b-input>
                    <p class="control">
                      <b-button class="button is-info" 
                                @click="lookup">
                        Look up
                      </b-button>
                    </p>
                  </b-field>
                </section>
                <section v-if="lookupFound">
                  <b-icon
                     icon="check"
                     type="is-primary">
                  </b-icon>
                  Signup found!
                </section>
              </section>
            </div>
          </form>
        </b-dropdown-item>
      </b-dropdown>
    </section>

    <section class="block">
      <h1 class="title is-3">Secret Samol 2020 Signups</h1>
      <p class="subtitle is-5">Fill out this form and submit some prompts for fanart/fanfic you'd like to receive as a gift! We'll pair people up based on the following questions to make sure everyone gets a set of prompts they feel comfortable with. 

      Signups will close by end of day, November 28th.</p>
    </section>

    <div v-if="this.existingSignupId" class="notification has-text-centered block">
      <strong>Signup ID<br>
      <span class="is-size-4">{{this.existingSignupId}}</span></strong>
    </div>

    <form-section :required='true'>
      <template v-slot:header>
        Name
      </template>
      <template v-slot:paragraph>
        What name/handle should we use to identify your signup? Preferably the same as your social media handle. Your assignee will also see this. 
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.name}"
                 :message="{'Please enter a name.': highlightError.name }">
          <b-input v-model="form.name" 
                   placeholder="Name"
                   @input="clearHighlight('name')"
                   >
          </b-input>
        </b-field>
      </template>
    </form-section>

    <form-section :required='true'>
      <template v-slot:header>
        E-mail Address
      </template>
      <template v-slot:paragraph>
        We will send assignments, completion forms, and completed gifts by email. 
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.email }"
                 :message="{'Please enter an e-mail.': highlightError.email }"
                 >
          <b-input v-model="form.email" 
                   placeholder="E-mail"
                   @input="clearHighlight('email')"
                   ></b-input>
        </b-field>
      </template>
    </form-section>

    <form-section :required='true'>
      <template v-slot:header>
        Preferred Contact
      </template>
      <template v-slot:paragraph>
        If you have a preferred way for us to contact you with possible questions about your signup, please enter the platform and your username here.<br>
        - Twitter, Tumblr, and Discord are OK. If Discord, remember to provide us with the 4-digit number after your username. <br>
        - You can select E-mail as well to just have us e-mail you.
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.contact}"
                 :message="{'Please enter a preferred contact.': highlightError.contact }">
          <b-select v-model="form.contact_platform" placeholder="Platform"
                    @input="clearHighlight('contact')">
            <option value="Twitter">Twitter</option>
            <option value="Tumblr">Tumblr</option>
            <option value="Discord">Discord</option>
            <option value="E-mail">E-mail</option>
          </b-select>
          <b-input v-model="form.contact_username" 
                   placeholder="Username" 
                   expanded 
                   :disabled="form.contact_platform == 'E-mail'"
                   @input="clearHighlight('contact')"></b-input>
        </b-field>
      </template>
    </form-section>



    <h4 class="is-size-4 mb-2">Request</h4>

    <form-section :required='true'>
      <template v-slot:header>
        What characters would you like to receive a gift about?
      </template>
      <template v-slot:paragraph>
         If your character name isn't in the list, put them in at the top of the Request Prompts field. 
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.requestChars}"
                 :message="{'Please choose at least one character.': highlightError.requestChars }">
          <autocomplete :choices="characterLookup" 
                        :chosen="form.request_chars"
                        @input="form.request_chars = $event; clearHighlight('requestChars')"/>
        </b-field>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        What ships would you like to receive a gift about?
      </template>
      <template v-slot:paragraph>
        If your ship isn't in the list, put them in at the top of the Request Prompts field. 
      </template>
      <template v-slot:content>
        <autocomplete :choices="shipLookup" :chosen="form.request_ships"/>
      </template>
    </form-section>

    <form-section :required='true'>
      <template v-slot:header>
        Request Prompts
      </template>
      <template v-slot:paragraph>
        Please enter at least two prompts related to your characters and ships for your assignee!
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.requestText}"
                 :message="{'Please enter your requests.': highlightError.requestText }">
          <b-input type="textarea" v-model="form.request_text" @input="clearHighlight('requestText')"></b-input>
        </b-field>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        URL
      </template>
      <template v-slot:paragraph>
        If you have a social media link or website you would like your assignee to be able to look at to get a sense of who you are, enter it here. 
      </template>
      <template v-slot:content>
        <b-field>
          <b-input v-model="form.request_url" 
                   placeholder="URL"
                   >
          </b-input>
        </b-field>
      </template>
    </form-section>


    <h4 class="is-size-4 mb-2">Offer</h4>

    <form-section :required='true'>
      <template v-slot:header>
        Season Choices
      </template>
      <template v-slot:paragraph>
         What seasons of FatT have you listened to and would be comfortable making a gift about?
      </template>
      <template v-slot:content>
        <div class="field" v-for="(season, id) in seasonLookup" :key="id">
          <b-checkbox v-model="form.offer_seasons" 
                      @input="clearHighlight('offerSeasons')"
                      :native-value="season.id"> 
            {{season.name}}
          </b-checkbox>
        </div>
        <span class="has-text-danger is-size-7" v-if="highlightError.offerSeasons">Please pick at least one season.</span>
      </template>
    </form-section>

    <form-section :required='true'>
      <template v-slot:header>
        What characters would you like to make a gift about?
      </template>
      <template v-slot:paragraph>
         If the character isn't here, list them at the top of the Offer Text field.
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.offerChars}"
                 :message="{'Please choose at least one character.': highlightError.offerChars }">
          <autocomplete :choices="characterLookup" 
                        :chosen="form.offer_chars" 
                        :disabled="form.offer_any"
                        @input="form.offer_chars = $event; clearHighlight('offerChars')"
                        />
        </b-field>
        <b-checkbox v-model="form.offer_any"
                    @input="clearHighlight('offerChars')"
                    >
          {{"I want to offer any character for the seasons I checked"}}
        </b-checkbox>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        What ships would you like to make a gift about?
      </template>
      <template v-slot:paragraph>
        If the ship isn't here, list them at the top of the Offer Text field. You can leave this blank if you don't want any ships. 
      </template>
      <template v-slot:content>
        <autocomplete :choices="shipLookup" :chosen="form.offer_ships"/>
      </template>
    </form-section>

    <form-section :required='true'>
      <template v-slot:header>
        Offer Text
      </template>
      <template v-slot:paragraph>
        Tell us any additional details about what you'd like to offer - what medium you'll be working in, specific tropes and tones you like to include in your work, etc.
      </template>
      <template v-slot:content>
        <b-field :type="{'is-danger': highlightError.offerText}"
                 :message="{'Please enter an offer.': highlightError.offerText }">
          <b-input type="textarea" v-model="form.offer_text" @input="clearHighlight('offerText')"></b-input>
        </b-field>
      </template>
    </form-section>

    <h4 class="is-size-4 mb-2">Other</h4>

    <form-section>
      <template v-slot:header>
        Are there characters you're not comfortable seeing in a gift/assignment?
      </template>
      <template v-slot:paragraph>
         If the character isn't in the list, you can enter them in the free-text field below.
      </template>
      <template v-slot:content>
        <autocomplete :choices="characterLookup" :chosen="form.unwanted_chars"/>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        Are there ships you're not comfortable seeing in a gift/assignment?
      </template>
      <template v-slot:paragraph>
        If the ship isn't in the list, you can enter them in the free-text field below. 
      </template>
      <template v-slot:content>
        <autocomplete :choices="shipLookup" :chosen="form.unwanted_ships"/>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        Is there anything else you're not comfortable seeing in a gift/assignment?
      </template>
      <template v-slot:paragraph>
        You can list characters and ships that weren't in the above fields here as well. If there are specific tropes you don't like (ex. kidfic) or mediums that you cannot engage with for accessibility reasons (ex. music when hard of hearing), please enter them here.
      </template>
      <template v-slot:content>
        <b-input type="textarea" v-model="form.unwanted_text"></b-input>
      </template>
    </form-section>

    <form-section>
      <template v-slot:header>
        Anything else you want to tell the mods?
      </template>
      <template v-slot:content>
        <b-field>
          <b-input v-model="form.other"></b-input>
        </b-field>
      </template>
    </form-section>

    <div class="notification is-warning block"
         v-if="!validationPassed">
      One or more required fields are missing. Please double check your signup!
    </div>

    <section class="block has-text-right">
      <b-button type="is-success" @click="submit">
        <span v-if="!submitting">Submit</span>
        <span v-if="submitting">Submitting...</span>
      </b-button>
    </section>

  </div>
</template>

<script>
import Autocomplete from './components/Autocomplete.vue'
import FormSection from './components/FormSection.vue'


export default {
  name: 'App',
  components: {
    Autocomplete,
    FormSection
  },
  data: function() {
    return {
      existingSignupId: null,
      form: {
        'email': '',
        'name': '',
        'other': '',
        'contact_platform': null,
        'contact_username': '',
        'request_chars': [],
        'request_ships': [],
        'request_text': '',
        'request_url': '',
        'offer_chars': [],
        'offer_ships': [],
        'offer_text': '',
        'offer_seasons': [],
        'offer_any': false,
        'unwanted_chars': [],
        'unwanted_ships': [],
        'unwanted_text': ''
      },
      characterLookup: {},
      shipLookup: {},
      seasonLookup: {},
      lookupFieldType: '',
      lookupErrorMessage: '',
      lookupId: '',
      lookupFound: false,
      highlightError: {
        name: false,
        email: false,
        contact: false,
        requestChars: false,
        requestText: false,
        offerSeasons: false,
        offerChars: false,
        offerText: false
      },
      submitting: false
    }
  },
  computed: {
    validationPassed: function() {
      return Object.values(this.highlightError).every(v => v == false)
    }
  },
  methods: {

    getAllChoices() {
      var choiceCalls = [
        this.$http.get('characters'),
        this.$http.get('ships'),
        this.$http.get('seasons')
      ]

      Promise.all(choiceCalls).then((responses) => {
        this.characterLookup = responses[0].data
        this.shipLookup = responses[1].data
        this.seasonLookup = responses[2].data
      }, (error) => {
        console.log(error)
        this.alertError(error, 'There was an issue contacting the server. The form may not work correctly. Try refreshing the page.')
      })

    },

    lookup() {
      const loadingComponent = this.$buefy.loading.open({
        container: this.$refs.lookup.$el
      })

      if (this.lookupId) {

        this.$http.get('signup/' + this.lookupId).then(response => {
          this.existingSignupId = this.lookupId
          this.form = response.data
          this.lookupId = ''
          this.lookupFound = true
          Object.keys(this.highlightError).map((k) => {
            this.highlightError[k] = false
          })
          loadingComponent.close()
        }, error => {
          console.log(error)
          loadingComponent.close()
          this.lookupFieldType = 'is-danger'
          this.lookupErrorMessage = "ID could not be found!"
        });
      }
    },

    clearLookupField() {
      this.lookupFieldType = ''
      this.lookupErrorMessage = ''
      this.lookupFound = false
    },

    validate() {
      if (this.form.name.length <= 0) this.highlightError.name = true
      if (this.form.email.length <= 0) this.highlightError.email = true
      if (!(this.form.contact_platform) || 
          (this.form.contact_platform != 'E-mail' && this.form.contact_username.length <= 0)) {
        this.highlightError.contact = true
      }
      if (this.form.request_chars.length <= 0) this.highlightError.requestChars = true
      if (this.form.request_text.length <= 0) this.highlightError.requestText = true
      if (this.form.offer_seasons.length <= 0) this.highlightError.offerSeasons = true
      if (this.form.offer_chars.length <= 0 && !this.form.offer_any) this.highlightError.offerChars = true
      if (this.form.offer_text.length <= 0) this.highlightError.offerText = true

      return Object.values(this.highlightError).every(v => v == false)
    },

    clearHighlight(key) {
      this.highlightError[key] = false
    },

    submit() {
      this.submitting = true;
      if (this.validate()) {
        this.submitExisting();
      } else {
        this.submitting = false;
      }
    },

    submitNew() {
      console.log('ok');
      this.$http.post('signup/new', this.form).then(response => {
        this.submitting = false
        this.$buefy.dialog.alert({
          message: `
            <p class="block is-size-5 has-text-centered">
              <strong>Your signup was submitted successfully!</strong>
            </p>
            <div class="notification is-success has-text-centered block">
              <strong>Your signup ID<br>
              <span class="is-size-4">`+response.data+`</span></strong>
            </div>
            <p class="block has-text-centered">Please keep this ID. You can use it to view or edit your signup, until the signup period closes.</p>
          `
        })
        this.existingSignupId = response.data
      }, (error) => {
        this.alertError(error, 'Something went wrong contacting the server. Your signup was not successfully submitted. Please try again.')
      })
    },

    submitExisting() {
      this.$http.post('signup/update/' + this.existingSignupId, this.form).then(() => {
        this.submitting = false
        this.$buefy.dialog.alert({
          message: `<p class="block is-size-5 has-text-centered">
              Your signup was updated successfully!
            </p>`
        })
        
      }, (error) => {
        this.alertError(error, 'Something went wrong contacting the server. Your signup was not successfully updated. Please try again.')
      })
    },

    alertError(error, msg) {
      console.log(error);
      this.submitting = false
      this.$buefy.dialog.alert({
        message: msg,
        confirmText: 'OK'
      })
    }

  },
  created() {
    this.getAllChoices();
  }
}
</script>

