<script>
  export default {
    name: 'form-section',
    props: ['size', 'required']
  }
</script>

<template>
  <section class="block">
    <p class="mb-1">
      <strong class="is-size-6">
        <slot name="header"></slot>
      </strong>
      <b-icon v-if="required" icon="asterisk" size="is-small" type="is-info is-light"></b-icon>
      <br>
      <slot name="paragraph"></slot>
    </p>
    <slot name="content"></slot>
  </section>
</template>