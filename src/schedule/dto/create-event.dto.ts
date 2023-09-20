export class CreateEventDto {
  start: string;
  type: 'standard' | 'infant' | 'wedding';
  summary: 'package 1' | 'package 2' | 'package 3' | 'lifestyle/newborn';
}

export class PhotoShootVariety {
  package1 = {
    duration: 1,
  };
  package2 = {
    duration: 1,
  };
  package3 = {
    duration: 1,
  };
  infant = {
    duration: 24,
  };
}
