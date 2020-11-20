<script>
  export default {
    name: 'autocomplete',
    props: {
      choices: {
        type: Object,
        default: () => { return {} }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      chosen: {
        type: Array,
        default: () => { return [] }
      }
    },
    watch: {
      chosen: function(newVal) {
        this.currentChosen = newVal;
      }
    },
    data() {
      return {
        filtered: [],
        currentChosen: []
      }
    },
    methods: {
      respondToSelect(option) {
        if (option) {
          this.currentChosen.push(option.id);
        }
      },
      removeItem(index) {
        this.currentChosen.splice(index, 1);
      },
      choicesFiltered(input) {
        this.filtered = Object.keys(this.choices).filter(c => {
          var co = this.choices[c]
          return this.currentChosen.indexOf(c) < 0 && co.name &&
                 co.name.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
        })
      }
    } 
  }
</script>

<template>
      <b-taginput
          v-model="currentChosen"
          autocomplete
          :data="filtered"
          :disabled="disabled"
          placeholder="Add..."
          @typing="choicesFiltered"
          @input="$emit('input', currentChosen)">
        <template slot-scope="props">
          {{choices[props.option].name}}
        </template>
        <template slot="selected" slot-scope="props">
            <b-tag
                v-for="(tag, index) in props.tags"
                :key="index"
                closable
                @close="removeItem(index)">
                {{choices[tag].name}}
            </b-tag>
        </template>
      </b-taginput>
</template>